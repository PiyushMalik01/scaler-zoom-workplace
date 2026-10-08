import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Zoom Workplace | Meetings",
  description:
    "Start, join, and schedule video meetings. An original fullstack assignment implementation.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
