/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    session: import("@repo/auth").SessionBundle | null;
    appRole: import("./lib/auth").CancioneroAppRole;
    canContribute: boolean;
    canModerate: boolean;
  }
}
