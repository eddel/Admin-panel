import type { Metadata } from "next";
import { Inter, Manrope, Roboto } from "next/font/google";
import "./globals.css";
import { Sidebar, Header } from "@/components";
import { usePathname } from "next/navigation";
import ProviderContainer from "@/components/Provider";

const inter = Roboto({
  subsets: ["latin"],
  style: "normal",
  weight: "400",
  variable: "--font-RB400",
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex h-[100%]`}>
        <ProviderContainer>
          {/* SideBar */}
          <Sidebar />
          <div className="bg-black2 flex-1 flex-grow">
            {/* header */}
            <Header />
            {children}
          </div>
        </ProviderContainer>
      </body>
    </html>
  );
}
