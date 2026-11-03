import { Geist, Geist_Mono } from "next/font/google";
import "react-phone-number-input/style.css";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ClientLayoutWrapper } from "./ClientLayoutWrapper";
import { Analytics } from "@vercel/analytics/next";
import DismissMobileDevOverlay from "@/components/DismissMobileDevOverlay";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Room",
  description: "Trouver facilement des logements",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased pt-16`}
        suppressHydrationWarning
      >
        <DismissMobileDevOverlay />
        <Header />
        <ClientLayoutWrapper>
          {children}
          <Footer />
        </ClientLayoutWrapper>
        {process.env.NODE_ENV === "production" ? <Analytics /> : null}
      </body>
    </html>
  );
}
