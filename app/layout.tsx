import type { Metadata } from "next";
import React from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "NutriMate AI — Nutrisi Lebih Tepat untuk Ibu dan Si Kecil",
  description:
    "NutriMate AI adalah platform pendamping nutrisi berbasis AI untuk ibu hamil dan ibu dengan anak berusia di bawah 2 tahun, dilengkapi rekomendasi bahan pangan dan sistem bantuan donasi.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
