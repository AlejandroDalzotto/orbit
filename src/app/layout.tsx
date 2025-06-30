import Grainy from "@/components/Grainy";
import Navbar from "@/components/Navbar";
import { Exo_2 } from "next/font/google";
import "./globals.css";
import { ModalProvider } from "@/context/modal-provider";

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
        className={`${exo2.variable} antialiased flex flex-col font-exo w-screen relative h-screen text-neutral-50 bg-[rgb(9,7,7)]`}
      >
        <ModalProvider>
          <Grainy />
          <Navbar />
          <main className="flex w-full h-full overflow-hidden">
            {children}
          </main>
        </ModalProvider>
      </body>
    </html>
  );
}
