import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "../..");
const source = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), "utf8");

describe("standalone phased setup onboarding", () => {
  it("keeps setup outside the operational MainLayout and protects it with its own authenticated shell", () => {
    const page = source("app/setup/page.tsx");
    const layout = source("app/setup/layout.tsx");

    expect(page).not.toContain("MainLayout");
    expect(layout).not.toContain("SideNavigationBar");
    expect(layout).toContain("verifySetupAccess");
    expect(layout).toContain("setup_required");
  });

  it("renders mandatory phase progress before gated module activation", () => {
    const page = source("app/setup/page.tsx");
    const moduleSelection = source("app/setup/components/SetupModuleSelection.tsx");

    expect(page.indexOf("<SetupPhaseProgress")).toBeLessThan(page.indexOf("<SetupModuleSelection"));
    expect(page).toContain("foundationComplete={onboarding?.phases.foundation.ready === true}");
    expect(moduleSelection).toContain("coreModuleKeys");
    expect(moduleSelection).toContain("canActivate");
    expect(moduleSelection).toContain("coreTitle");
    expect(moduleSelection).toContain("optionalTitle");
  });

  it("emits setup in the static catch-all parameter set", () => {
    const virtualRoute = source("app/[...virtual]/page.tsx");

    expect(virtualRoute).toContain('paths.set("setup", { virtual: ["setup"] })');
  });
});
