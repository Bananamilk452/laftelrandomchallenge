import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SERVICE_URL } from "@/lib/site";
import { Providers } from "./providers";

const parkDaHyun = localFont({
  src: "./fonts/Ownglyph_ParkDaHyun.woff2",
  variable: "--font-park-dahyun",
  display: "swap",
  weight: "400",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(SERVICE_URL),
  title: "랜덤 라프텔 챌린지",
  description:
    "라프텔에서 본 애니를 랜덤으로 뽑아 별점과 한줄평을 남기고 공유해보세요.",
  alternates: {
    canonical: SERVICE_URL,
  },
  openGraph: {
    title: "랜덤 라프텔 챌린지",
    description:
      "라프텔에서 본 애니를 랜덤으로 뽑아 별점과 한줄평을 남기고 공유해보세요.",
    url: SERVICE_URL,
    siteName: "랜덤 라프텔 챌린지",
    locale: "ko_KR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7efdf",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${parkDaHyun.variable} h-full antialiased`}>
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
