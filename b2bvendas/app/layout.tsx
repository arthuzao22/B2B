import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "B2B Marketplace",
  description: "Plataforma B2B de e-commerce",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
