import { allDomains } from "@/lib/navigation";
import VirtualNavigationClient from "./VirtualNavigationClient";

/**
 * A static export cannot render arbitrary catch-all params at runtime. Emit the
 * virtual folder paths that are actually represented by the navigation tree;
 * dedicated screen routes continue to take precedence over this fallback.
 */
export const dynamicParams = false;

export function generateStaticParams(): Array<{ virtual: string[] }> {
  const paths = new Map<string, { virtual: string[] }>();

  for (const domain of allDomains) {
    const domainSegment = `${String(domain.order).padStart(2, "0")}-${domain.id}`;
    const domainPath = [domainSegment];
    paths.set(domainPath.join("/"), { virtual: domainPath });

    for (const capability of domain.capabilities) {
      const capabilityPath = [domainSegment, capability.id];
      paths.set(capabilityPath.join("/"), { virtual: capabilityPath });

      for (const group of capability.groups) {
        const groupPath = [...capabilityPath, group.id];
        paths.set(groupPath.join("/"), { virtual: groupPath });
      }
    }
  }

  return [...paths.values()];
}

export default function VirtualNavigationPage() {
  return <VirtualNavigationClient />;
}
