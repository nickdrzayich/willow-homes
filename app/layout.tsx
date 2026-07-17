import type { Metadata, Viewport } from "next";
import { Ubuntu, Ubuntu_Mono } from "next/font/google";

// Declared here (not in app/admin/layout.tsx) so the --font-sans/--font-mono custom
// properties are set on <html>, an ancestor of <body> -- globals.css's `body { @apply
// font-sans }` rule needs the variable resolvable at or above <body> to inherit correctly.
// Harmless on marketing pages: globals.css itself only loads as part of the /admin route
// chunk, so these variables go unused (and unreferenced) outside /admin.
const ubuntuSans = Ubuntu({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const ubuntuMono = Ubuntu_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Willow Homes",
  description: "Custom home building in Idaho.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ubuntuSans.variable} ${ubuntuMono.variable} h-full antialiased`}
      // The marketing layout's Webflow touch-detection script appends " w-mod-js"/" w-mod-touch"
      // to this element's className right before hydration (matching Webflow's own sites) --
      // React would otherwise flag the resulting mismatch as a hydration error.
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
