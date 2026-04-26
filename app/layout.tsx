import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "salesforce-api-playground",
  description: "Salesforce REST API learning playground for Accounts and Contacts."
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
