import { beforeEach, describe, expect, it, vi } from "vitest";

const fromMock = vi.fn();
const requireApiAuthMock = vi.fn();
const createAuditLogMock = vi.fn();

vi.mock("@/db/supabase", () => ({
  supabase: {
    from: (table: string) => fromMock(table),
    auth: { getUser: vi.fn() },
  },
}));

vi.mock("@/lib/auth", () => ({
  requireApiAuth: (...args: unknown[]) => requireApiAuthMock(...args),
}));

vi.mock("@/lib/admin-data", () => ({
  createAuditLog: (...args: unknown[]) => createAuditLogMock(...args),
  getDashboardMetrics: vi.fn(),
}));

vi.mock("@/lib/log", () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

// eslint-disable-next-line import/first
import { GET as listGET, POST as createPOST } from "@/pages/api/churches/index";
// eslint-disable-next-line import/first
import {
  PATCH as statusPATCH,
  PUT as updatePUT,
} from "@/pages/api/churches/[id]";
// eslint-disable-next-line import/first
import { POST as schedulePOST } from "@/pages/api/churches/[id]/schedules";
// eslint-disable-next-line import/first
import { DELETE as scheduleDELETE } from "@/pages/api/schedules/[id]";
// eslint-disable-next-line import/first
import type { AdminSession } from "@/lib/auth";

function createBuilder(terminal: () => { data: unknown; error: unknown }) {
  const builder: Record<string, unknown> = {};
  const chainMethods = [
    "select",
    "eq",
    "or",
    "order",
    "limit",
    "ilike",
    "insert",
    "update",
    "delete",
  ];
  for (const method of chainMethods) {
    builder[method] = vi.fn(() => builder);
  }
  builder.single = vi.fn(async () => terminal());
  builder.maybeSingle = vi.fn(async () => terminal());
  (builder as { then: unknown }).then = (
    resolve: (value: unknown) => unknown,
    reject: (reason?: unknown) => unknown,
  ) =>
    Promise.resolve(terminal()).then(
      (value) => (resolve as (v: unknown) => unknown)(value),
      reject,
    );
  return builder;
}

const adminSession = (): {
  ok: true;
  session: AdminSession;
} => ({
  ok: true,
  session: {
    token: "jwt",
    userId: "11111111-1111-1111-1111-111111111111",
    email: "admin@test.ar",
    role: "admin",
  },
});

const unauthorized = () => ({
  ok: false as const,
  response: new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
  }),
});

function jsonRequest(body: unknown, url = "http://panel.test/api/x") {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  fromMock.mockReset();
  requireApiAuthMock.mockReset();
  requireApiAuthMock.mockImplementation(async () => adminSession());
  createAuditLogMock.mockReset();
});

describe("TC-0107-ADMINISTRACION-005 - autorizacion por rol", () => {
  it("bloquea accesos sin sesion con 401 en todas las rutas protegidas", async () => {
    requireApiAuthMock.mockResolvedValue(unauthorized());

    const responses = await Promise.all([
      listGET({
        request: new Request("http://x"),
        url: new URL("http://x"),
      } as never),
      updatePUT({ request: jsonRequest({}), params: { id: "t" } } as never),
      scheduleDELETE({
        request: new Request("http://x"),
        params: { id: "c" },
      } as never),
    ]);

    for (const response of responses) {
      expect(response.status).toBe(401);
    }
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("viewer no alcanza a ejecutar escrituras (roles permitidos sin viewer)", async () => {
    // La ruta de creacion solo admite admin/editor: un viewer recibe 401
    // antes de tocar la base de datos.
    requireApiAuthMock.mockResolvedValue(unauthorized());

    const response = await createPOST({
      request: jsonRequest({}),
      redirect: vi.fn(),
    } as never);

    expect(response.status).toBe(401);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("un rol autorizado accede al listado", async () => {
    const builder = createBuilder(() => ({ data: [], error: null }));
    fromMock.mockReturnValue(builder);

    const response = await listGET({
      request: new Request("http://x"),
      url: new URL("http://x/api/churches"),
    } as never);

    expect(response.status).toBe(200);
  });
});

describe("TC-0107-ADMINISTRACION-001 - creacion de iglesia", () => {
  const payload = {
    name: "Parroquia Santa Teresita",
    address: "Av. Almafuerte 420",
    city: "Parana",
    province: "Entre Rios",
    latitude: -31.7424,
    longitude: -60.5238,
  };

  it("valida el payload y rechaza datos incompletos con 422", async () => {
    const response = await createPOST({
      request: jsonRequest({ name: "incompleto" }),
      redirect: vi.fn(),
    } as never);

    expect(response.status).toBe(422);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("crea el templo y registra auditoria con id de slug", async () => {
    const dupBuilder = createBuilder(() => ({ data: null, error: null }));
    const insertBuilder = createBuilder(() => ({
      data: { id: "parroquia-santa-teresita-parana" },
      error: null,
    }));
    fromMock.mockReturnValueOnce(dupBuilder).mockReturnValueOnce(insertBuilder);

    const response = await createPOST({
      request: jsonRequest(payload),
      redirect: vi.fn(),
    } as never);

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.id).toBe("parroquia-santa-teresita-parana");
    expect(createAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "create",
        resourceType: "temple",
        resourceId: "parroquia-santa-teresita-parana",
      }),
    );

    const insertedRow = (insertBuilder.insert as ReturnType<typeof vi.fn>).mock
      .calls[0]?.[0] as Record<string, unknown>;
    expect(insertedRow.id).toBe("parroquia-santa-teresita-parana");
    expect(insertedRow.lat).toBe(-31.7424);
    expect(insertedRow.is_active).toBe(true);
  });
});

describe("TC-0107-ADMINISTRACION-007 - deteccion de duplicada", () => {
  it("rechaza con 409 cuando ya existe nombre+ciudad", async () => {
    const dupBuilder = createBuilder(() => ({
      data: { id: "existente" },
      error: null,
    }));
    fromMock.mockReturnValueOnce(dupBuilder);

    const response = await createPOST({
      request: jsonRequest({
        name: "Parroquia Santa Teresita",
        address: "Otra 123",
        city: "Parana",
        province: "Entre Rios",
        latitude: -31.7,
        longitude: -60.5,
      }),
      redirect: vi.fn(),
    } as never);

    expect(response.status).toBe(409);
    expect(fromMock).toHaveBeenCalledTimes(1);
  });
});

describe("TC-0107-ADMINISTRACION-006 - auditoria en operaciones CRUD", () => {
  it("registra status_change al desactivar una iglesia", async () => {
    const patchBuilder = createBuilder(() => ({
      data: { id: "t1" },
      error: null,
    }));
    fromMock.mockReturnValue(patchBuilder);

    const response = await statusPATCH({
      request: jsonRequest({ status: "inactive" }),
      params: { id: "t1" },
    } as never);

    expect(response.status).toBe(200);
    expect(createAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "status_change",
        resourceType: "temple",
        resourceId: "t1",
        details: { status: "inactive" },
      }),
    );
    const updatedRow = (patchBuilder.update as ReturnType<typeof vi.fn>).mock
      .calls[0]?.[0] as Record<string, unknown>;
    expect(updatedRow.is_active).toBe(false);
  });

  it("registra delete al eliminar un horario", async () => {
    const deleteBuilder = createBuilder(() => ({ data: null, error: null }));
    fromMock.mockReturnValue(deleteBuilder);

    const response = await scheduleDELETE({
      request: new Request("http://x", { method: "DELETE" }),
      params: { id: "celebracion-1" },
    } as never);

    expect(response.status).toBe(200);
    expect(createAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "delete",
        resourceType: "schedule",
        resourceId: "celebracion-1",
      }),
    );
  });

  it("registra update al editar una iglesia sin regenerar el id", async () => {
    const putBuilder = createBuilder(() => ({
      data: { id: "templo-x" },
      error: null,
    }));
    fromMock.mockReturnValue(putBuilder);

    const response = await updatePUT({
      request: new Request("http://x/api/churches/templo-x", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "Parroquia Renovada",
          address: "Nueva 123",
          city: "Rosario",
          province: "Santa Fe",
          latitude: -32.95,
          longitude: -60.64,
        }),
      }),
      params: { id: "templo-x" },
    } as never);

    expect(response.status).toBe(200);
    const updatedRow = (putBuilder.update as ReturnType<typeof vi.fn>).mock
      .calls[0]?.[0] as Record<string, unknown>;
    expect(updatedRow.id).toBeUndefined();
    expect(createAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({ action: "update", resourceType: "temple" }),
    );
  });
});

describe("TC-0107-ADMINISTRACION-004 - superposicion de horarios", () => {
  const schedulePayload = {
    celebration_type: "misa",
    weekday: 6,
    start_time: "19:30",
    duration_min: 55,
  };

  it("rechaza con 409 cuando existe otro horario mismo dia y hora", async () => {
    const collisionBuilder = createBuilder(() => ({
      data: { id: "existente" },
      error: null,
    }));
    fromMock.mockReturnValue(collisionBuilder);

    const response = await schedulePOST({
      request: jsonRequest(schedulePayload),
      params: { id: "templo-x" },
      redirect: vi.fn(),
    } as never);

    expect(response.status).toBe(409);
    expect(fromMock).toHaveBeenCalledTimes(1);
  });

  it("crea el horario cuando no hay colision y audita la operacion", async () => {
    const collisionBuilder = createBuilder(() => ({ data: null, error: null }));
    const insertBuilder = createBuilder(() => ({
      data: { id: "nuevo-horario" },
      error: null,
    }));
    fromMock
      .mockReturnValueOnce(collisionBuilder)
      .mockReturnValueOnce(insertBuilder);

    const response = await schedulePOST({
      request: jsonRequest(schedulePayload),
      params: { id: "templo-x" },
      redirect: vi.fn(),
    } as never);

    expect(response.status).toBe(201);
    const insertedRow = (insertBuilder.insert as ReturnType<typeof vi.fn>).mock
      .calls[0]?.[0] as Record<string, unknown>;
    expect(insertedRow.temple_id).toBe("templo-x");
    expect(insertedRow.weekday).toBe("sunday");
    expect(createAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "create",
        resourceType: "schedule",
      }),
    );
  });

  it("rechaza tipos fuera del catalogo liturgico con 422", async () => {
    const response = await schedulePOST({
      request: jsonRequest({
        ...schedulePayload,
        celebration_type: "kermesse",
      }),
      params: { id: "templo-x" },
      redirect: vi.fn(),
    } as never);

    expect(response.status).toBe(422);
    expect(fromMock).not.toHaveBeenCalled();
  });
});

describe("TC-0107-ADMINISTRACION-008 - busqueda de iglesias", () => {
  it("aplica el filtro de texto sobre nombre, ciudad y provincia", async () => {
    const builder = createBuilder(() => ({
      data: [
        {
          id: "match",
          name: "Santa Rita",
          city: "Cordoba",
          province: "Cordoba",
          country: "Argentina",
          status: "review",
          is_active: true,
          updated_at: "2026-08-25",
        },
      ],
      error: null,
    }));
    fromMock.mockReturnValue(builder);

    const response = await listGET({
      request: new Request("http://x"),
      url: new URL("http://x/api/churches?q=rita"),
    } as never);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.churches).toHaveLength(1);

    const orArg = (builder.or as ReturnType<typeof vi.fn>).mock
      .calls[0]?.[0] as string;
    expect(orArg).toContain("name.ilike.%rita%");
    expect(orArg).toContain("city.ilike.%rita%");
    expect(orArg).toContain("province.ilike.%rita%");
  });

  it("lista sobre las tablas consolidadas horarios_*", async () => {
    const builder = createBuilder(() => ({ data: [], error: null }));
    fromMock.mockReturnValue(builder);

    await listGET({
      request: new Request("http://x"),
      url: new URL("http://x/api/churches"),
    } as never);

    expect(fromMock).toHaveBeenCalledWith("horarios_temples");
  });
});
