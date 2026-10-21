
import type { Metadata } from "next";
import React from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "NutriMate AI — Nutrisi Lebih Tepat untuk Ibu dan Si Kecil",
  description:
    "NutriMate AI adalah platform pendamping nutrisi berbasis AI untuk ibu hamil dan ibu dengan anak berusia 0 - 2 tahun, dilengkapi rekomendasi bahan pangan dan sistem bantuan donasi.",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@6..144,400..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}