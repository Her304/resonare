import type { Metadata } from "next";
import { Inter, Noto_Serif_JP } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", weight: ["400", "500", "600", "700"] });
const notoSerifJP = Noto_Serif_JP({ subsets: ["latin"], variable: "--font-noto-serif-jp", weight: ["500", "600", "700"] });

export const metadata: Metadata = {
  title: "resonare",
  description: "your concert diary",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=account_circle,add,art_track,camera_roll,confirmation_number,edit_square,home,stadium,star&display=block"
        />
      </head>
      <body className={`${inter.variable} ${notoSerifJP.variable}`}>{children}</body>
    </html>
  );
}
