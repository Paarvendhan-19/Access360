import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import { AccessibilityProvider } from "@/components/providers/AccessibilityProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Access360 – Inclusive Campus Companion",
  description: "A modular platform improving accessibility, wellbeing, and safety for students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>
        <AuthProvider>
          <AccessibilityProvider>
            {children}
          </AccessibilityProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
