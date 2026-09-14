import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Make3D — Organizer Generator",
  description: "Browser-based parametric organizer generator for 3D printing.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
