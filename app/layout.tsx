import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PromptCanvas | Plan Better. Build Smarter.",
  description: "A premium workspace to plan software products before writing code.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-[#050505] text-[#fafafa] antialiased selection:bg-white/20 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
