import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Providers } from "./providers";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FloraFetch — Premium Botanical Marketplace",
  description: "Discover rare and curated indoor & outdoor plants. Expert care, fast delivery, and a community of plant lovers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${plusJakarta.variable} h-full`}
    >
      <body className="min-h-full flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}
