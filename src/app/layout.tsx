import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AIMS — Agent Intelligence Management System",
  description: "Live workspace viewer for your OpenClaw AI agents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-color-mode="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <SidebarProvider>
          {children}
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
