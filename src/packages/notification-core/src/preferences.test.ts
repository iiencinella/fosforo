import { describe, expect, it } from "vitest";
import {
  isMandatoryCategory,
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CHANNELS,
} from "./channels.js";
import {
  applyPreferenceChange,
  canSend,
  defaultPreferences,
} from "./preferences.js";

describe("canales y categorias", () => {
  it("define tres canales y cuatro categorias", () => {
    expect(NOTIFICATION_CHANNELS).toEqual(["email", "push", "in_app"]);
    expect(NOTIFICATION_CATEGORIES).toEqual([
      "transactional",
      "product",
      "liturgical",
      "community",
    ]);
  });

  it("solo transactional es obligatoria (RB-NOTIF-002)", () => {
    expect(isMandatoryCategory("transactional")).toBe(true);
    expect(isMandatoryCategory("product")).toBe(false);
    expect(isMandatoryCategory("liturgical")).toBe(false);
    expect(isMandatoryCategory("community")).toBe(false);
  });
});

describe("preferencias (FR-NOTIF-003)", () => {
  it("defaults: solo transactional optada, el resto exige opt-in", () => {
    const prefs = defaultPreferences("user-1");
    expect(prefs).toHaveLength(12); // 3 canales x 4 categorias
    for (const pref of prefs) {
      expect(pref.optedIn).toBe(pref.category === "transactional");
    }
  });

  it("canSend respeta el opt-in por canal y categoria", () => {
    const prefs = defaultPreferences("user-1");
    expect(canSend(prefs, "user-1", "email", "transactional")).toBe(true);
    expect(canSend(prefs, "user-1", "email", "liturgical")).toBe(false);

    const withOptIn = applyPreferenceChange(prefs, {
      userId: "user-1",
      channel: "email",
      category: "liturgical",
      optedIn: true,
    });
    expect(canSend(withOptIn, "user-1", "email", "liturgical")).toBe(true);
    expect(canSend(withOptIn, "user-1", "push", "liturgical")).toBe(false);
  });

  it("las categorias obligatorias se envian aunque el usuario las desactive", () => {
    const denied = applyPreferenceChange(defaultPreferences("user-1"), {
      userId: "user-1",
      channel: "email",
      category: "transactional",
      optedIn: false,
    });
    expect(canSend(denied, "user-1", "email", "transactional")).toBe(true);
  });

  it("applyPreferenceChange crea la preferencia si no existe y es pura", () => {
    const base = defaultPreferences("user-1");
    const changed = applyPreferenceChange(base, {
      userId: "user-1",
      channel: "push",
      category: "product",
      optedIn: true,
    });

    expect(
      base.find((p) => p.channel === "push" && p.category === "product")
        ?.optedIn,
    ).toBe(false);
    expect(
      changed.find((p) => p.channel === "push" && p.category === "product")
        ?.optedIn,
    ).toBe(true);
    expect(changed).not.toBe(base);
  });

  it("canSend para otro usuario no comparte preferencias", () => {
    const prefs = defaultPreferences("user-1");
    expect(canSend(prefs, "user-2", "email", "transactional")).toBe(true);
    expect(canSend(prefs, "user-2", "email", "liturgical")).toBe(false);
  });
});
