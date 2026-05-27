import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Salesforce API Playground",
    description: "取引先と取引先責任者を操作する Salesforce REST API 学習用プレイグラウンドです。"
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ja">
            <body>{children}</body>
        </html>
    );
}
