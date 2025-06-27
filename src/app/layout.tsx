import Grainy from "@/components/Grainy";
import { Exo_2 } from "next/font/google";
import "./globals.css";

const exo2 = Exo_2({
  variable: "--font-exo-2",
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
        className={`${exo2.variable} antialiased flex font-exo w-screen relative p-4 h-screen text-neutral-50 bg-neutral-950`}
      >
        <Grainy />
        <main className="flex w-full h-full overflow-x-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
