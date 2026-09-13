import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Application — Private Archive",
  description: "An anonymous application archive for something slightly unusual.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
