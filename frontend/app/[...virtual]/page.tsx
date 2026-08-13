import VirtualNavigationClient from "./VirtualNavigationClient";

// Dynamic fallback routes cannot be emitted by a static export. Dedicated
// application routes remain available in the desktop build; unknown paths use
// the packaged application's normal not-found behavior.
export function generateStaticParams() {
  return [{ virtual: ["desktop"] }];
}

export default function VirtualNavigationPage() {
  return <VirtualNavigationClient />;
}
