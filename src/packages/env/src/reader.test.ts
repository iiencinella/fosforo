import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ENV_ALIASES,
  MissingEnvError,
  readEnv,
  requireEnv,
  requireEnvValues,
} from "./reader.js";

const CANONICAL = "TEST_ENV_UNIFICATION_CANONICAL";
const ALIAS = "TEST_ENV_UNIFICATION_DEPRECATED_ALIAS";
const OTHER = "TEST_ENV_UNIFICATION_OTHER";

describe("@repo/env reader", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    ENV_ALIASES[CANONICAL] = [ALIAS];
  });

  afterEach(() => {
    delete process.env[CANONICAL];
    delete process.env[ALIAS];
    delete process.env[`${ALIAS}_A`];
    delete process.env[`${ALIAS}_B`];
    delete process.env[OTHER];
    delete ENV_ALIASES[CANONICAL];
    warnSpy.mockRestore();
  });

  describe("readEnv", () => {
    it("resuelve la variable canonica sin warnings", () => {
      process.env[CANONICAL] = "canonical-value";

      expect(readEnv(CANONICAL)).toBe("canonical-value");
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it("resuelve por alias deprecado y emite warning", () => {
      const aliasA = `${ALIAS}_A`;
      ENV_ALIASES[CANONICAL] = [aliasA];
      process.env[aliasA] = "alias-value";

      expect(readEnv(CANONICAL)).toBe("alias-value");
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(String(warnSpy.mock.calls[0]?.[0])).toContain(aliasA);
      expect(String(warnSpy.mock.calls[0]?.[0])).toContain(CANONICAL);
    });

    it("emite el warning una sola vez por proceso", () => {
      const aliasB = `${ALIAS}_B`;
      ENV_ALIASES[CANONICAL] = [aliasB];
      process.env[aliasB] = "alias-value";

      readEnv(CANONICAL);
      readEnv(CANONICAL);

      expect(warnSpy).toHaveBeenCalledTimes(1);
    });

    it("prefiere la canonica cuando ambas estan definidas", () => {
      process.env[CANONICAL] = "canonical-value";
      process.env[ALIAS] = "alias-value";

      expect(readEnv(CANONICAL)).toBe("canonical-value");
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it("devuelve vacio si nada esta definido", () => {
      expect(readEnv(CANONICAL)).toBe("");
    });
  });

  describe("requireEnv", () => {
    it("devuelve el valor cuando existe", () => {
      process.env[CANONICAL] = "value";

      expect(requireEnv(CANONICAL)).toBe("value");
    });

    it("lanza MissingEnvError con el nombre canonico cuando falta", () => {
      expect(() => requireEnv(CANONICAL)).toThrow(MissingEnvError);

      const error = (() => {
        try {
          requireEnv(CANONICAL);
          return null;
        } catch (error) {
          return error as MissingEnvError;
        }
      })();

      expect(error?.missing).toEqual([CANONICAL]);
      expect(error?.message).toContain(CANONICAL);
    });
  });

  describe("requireEnvValues", () => {
    it("devuelve todos los valores en orden", () => {
      process.env[CANONICAL] = "a";
      process.env[OTHER] = "b";

      expect(requireEnvValues(CANONICAL, OTHER)).toEqual(["a", "b"]);
    });

    it("agrega todas las faltantes en un solo error", () => {
      process.env[OTHER] = "b";

      try {
        requireEnvValues(CANONICAL, OTHER, "TEST_ENV_UNIFICATION_MISSING");
        expect.unreachable("deberia haber lanzado");
      } catch (error) {
        expect(error).toBeInstanceOf(MissingEnvError);
        const missingError = error as MissingEnvError;
        expect(missingError.missing).toEqual([
          CANONICAL,
          "TEST_ENV_UNIFICATION_MISSING",
        ]);
        expect(missingError.message).toContain(CANONICAL);
        expect(missingError.message).toContain("TEST_ENV_UNIFICATION_MISSING");
        expect(missingError.message).not.toContain(OTHER);
      }
    });
  });
});
