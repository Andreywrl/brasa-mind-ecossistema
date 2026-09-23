import type { Metadata, Viewport } from "next";
import {
  Barlow,
  Barlow_Semi_Condensed,
  Inter,
  JetBrains_Mono,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
});

const barlowSemiCondensed = Barlow_Semi_Condensed({
  variable: "--font-barlow-semi",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
  "https://brasa-mind-ecossistema.vercel.app";

export const viewport: Viewport = {
  themeColor: "#0e0c0b",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Brasamind",
    template: "%s | Brasamind",
  },
  description:
    "Acesse sua conta no Brasamind e entre na rede de empresários gaúchos que se reúnem todo mês para conectar, indicar e fechar negócios.",
  applicationName: "Brasamind",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/brand/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/brand/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/brand/apple-touch-icon.png" }],
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Brasamind",
    title: "Brasamind | Entrar",
    description:
      "Acesse sua conta no Brasamind e entre na rede de empresários gaúchos que se reúnem todo mês para conectar, indicar e fechar negócios.",
    url: "/",
    images: [
      {
        url: "/brand/og-image.png",
        width: 1200,
        height: 630,
        alt: "Brasamind: conecte, indique, feche negócios.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Brasamind | Entrar",
    description:
      "Acesse sua conta no Brasamind e entre na rede de empresários gaúchos que se reúnem todo mês para conectar, indicar e fechar negócios.",
    images: ["/brand/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('brasa-theme');if(t==='light')document.documentElement.classList.remove('dark');else document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`font-sans antialiased ${inter.variable} ${barlow.variable} ${barlowSemiCondensed.variable} ${jetbrainsMono.variable}`}
      >
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
