import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Weather Desk: forecasts for any city",
  description:
    "A weather dashboard built with Next.js, TypeScript and Tailwind CSS. Search any city, see current conditions, an hourly temperature chart and a 7-day forecast.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0c4a6e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
