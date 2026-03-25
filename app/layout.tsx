import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HSCD - PLC Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        <h1 className={"p-7 text-gray-400 w-50 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-2xl"}>HSCD - PLC DASHBOARD</h1>
        {children}
      </body>
    </html>
  );
}
