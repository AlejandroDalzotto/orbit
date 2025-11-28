import Grainy from "@/components/Grainy";
import { Exo_2 } from "next/font/google";
import "./globals.css";
import { ModalProvider } from "@/context/modal-provider";
import { ClientLayout } from "@/components/layouts/ClientLayout";
import Titlebar from "@/components/Titlebar";

const exo2 = Exo_2({
  variable: "--font-exo-2",
  weight: ["300", "400", "500"],
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
        className={`${exo2.variable} antialiased font-exo bg-black text-white overflow-hidden`}
      >
        <ModalProvider>
          <Grainy />
          <Titlebar />
          <ClientLayout>{children}</ClientLayout>
        </ModalProvider>
      </body>
    </html>
  );
}
