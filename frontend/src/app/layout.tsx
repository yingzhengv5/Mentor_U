import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { GroupProvider } from "@/contexts/GroupContext";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mentor U",
  description: "Find your mentor or mentee",
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
          <GroupProvider>
            <Navbar />
            {children}
            <Footer />
          </GroupProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
