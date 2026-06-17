import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BookClub Annotations",
  description: "A local-first social PDF annotation MVP.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
