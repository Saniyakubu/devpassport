import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import QueryProvider from "./query-provider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = "https://devpassport.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "devpassport — Your GitHub Identity, Beautifully Visualized",
    template: "%s | devpassport",
  },
  description:
    "devpassport generates stunning developer passports and shareable cards from your GitHub profile. Visualize your tech stack, contributions, achievements, and coding habits in a premium interactive format.",
  keywords: [
    "devpassport",
    "GitHub",
    "developer passport",
    "GitHub profile card",
    "GitHub stats",
    "developer identity",
    "GitHub visualization",
    "developer portfolio",
    "GitHub achievements",
    "tech stack card",
    "GitHub contributions",
    "developer card generator",
    "open source",
    "coding profile",
    "GitHub resume",
  ],
  authors: [{ name: "Saniya Kubu", url: "https://github.com/Saniyakubu" }],
  creator: "Saniya Kubu",
  publisher: "devpassport",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "devpassport",
    title: "devpassport — Your GitHub Identity, Beautifully Visualized",
    description:
      "Generate stunning developer passports and shareable cards from your GitHub profile. Visualize your tech stack, achievements, and coding DNA.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "devpassport — GitHub Developer Passport Generator",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "devpassport — Your GitHub Identity, Beautifully Visualized",
    description:
      "Generate stunning developer passports and shareable cards from your GitHub profile.",
    images: ["/og-image.png"],
    creator: "@Saniyakubu",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#030611",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-full flex flex-col">
        <QueryProvider>{children}</QueryProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
