import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PromptCanvas | Plan Better. Build Smarter.",
  description: "A premium workspace to plan software products before writing code.",
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans min-h-screen bg-[#050505] text-[#fafafa] antialiased selection:bg-white/20 selection:text-white">
        {children}
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
