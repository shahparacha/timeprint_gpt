import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
//import { ClerkProvider } from "@clerk/nextjs";
import HeaderWrapper from "./components/HeaderWrapper";
//import { light } from "@clerk/themes"; put back when we have a real project

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TimeprintßßGPT",
  description: "TimeprintSGPT: Project timelines, blueprints, and collaboration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    //<ClerkProvider appearance={{ baseTheme: light }}> put back when we have a real project
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#F5F5F5]`}
      >
        <HeaderWrapper />
        <main className="container mx-auto px-4">
          <div className="flex items-start justify-center min-h-screen">
            <div className="mt-20 w-full max-w-6xl">
              <div className="card-neumorphic">
                {children}
              </div>
            </div>
          </div>
        </main>
      </body>
    </html>
    //</ClerkProvider > put back when we have a real project
  );
}