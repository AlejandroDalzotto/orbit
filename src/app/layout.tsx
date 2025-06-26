import Grainy from "@/components/Grainy";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex font-geist-sans w-screen relative p-4 h-screen text-neutral-50 bg-neutral-950`}
      >
        <Grainy />
        <main className="flex w-full h-full overflow-x-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
