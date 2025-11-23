import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/firebase/authContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Unicorn Valves - Quote Generation",
  description: "Internal quote generation system for Unicorn Valves",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}