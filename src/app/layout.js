import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import contents from "@/data/config.json";
import "./globals.css";

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: contents.website.name,
  description: contents.website.description,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cormorantGaramond.variable} ${dmSans.variable}`}>
      <meta name="apple-mobile-web-app-title" content="OCDesk" />
      <body>{children}</body>
    </html>
  );
}
