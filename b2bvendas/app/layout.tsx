import type { Metadata } from "next";
import "./globals.css";
<<<<<<< HEAD

export const metadata: Metadata = {
  title: "B2B Marketplace",
  description: "Plataforma B2B de e-commerce",
=======
import AuthProvider from "@/src/components/AuthProvider";

export const metadata: Metadata = {
  title: "B2B Marketplace",
  description: "Marketplace B2B com gestão de pedidos e catálogo",
>>>>>>> copilot/vscode-mkn71nko-h6fp
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
<<<<<<< HEAD
        {children}
=======
        <AuthProvider>{children}</AuthProvider>
>>>>>>> copilot/vscode-mkn71nko-h6fp
      </body>
    </html>
  );
}
