import "@/styles/globals.css";
import React from "react";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};
export const metadata: Metadata = {
  title: {
    default: "Cybersift - Advanced Forensic Analysis Platform",
    template: "%s | Cybersift"
  },
  description: "Advanced forensic analysis platform with AI-powered threat detection, evidence processing, and automated reporting",
  applicationName: "Cybersift",
  keywords: ["digital forensics", "cyber investigation", "threat intelligence", "evidence analysis", "ai-powered forensics", "explainable AI", "log analysis", "PCAP analysis", "incident response"],
  authors: [{
    name: "Cybersift Forensics Team"
  }],
  creator: "Cybersift Forensics Team",
  publisher: "Cybersift Forensics Team",
  icons: {
    icon: [{
      url: "/favicon-16x16.png",
      sizes: "16x16",
      type: "image/png"
    }, {
      url: "/favicon-32x32.png",
      sizes: "32x32",
      type: "image/png"
    }, {
      url: "/favicon.ico",
      sizes: "48x48",
      type: "image/x-icon"
    }],
    apple: [{
      url: "/apple-touch-icon.png",
      sizes: "180x180",
      type: "image/png"
    }]
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ACTA"
  },
  formatDetection: {
    telephone: false
  }
};
export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <html lang="en" className={`${GeistSans.variable}`} data-unique-id="637717f4-3f38-49bd-b901-1064648f4896" data-loc="58:9-58:61" data-file-name="app/layout.tsx">
      <body data-unique-id="0be737f8-8734-4741-bbe8-3aa0c7638611" data-loc="59:6-59:12" data-file-name="app/layout.tsx">{children}</body>
    </html>;
}