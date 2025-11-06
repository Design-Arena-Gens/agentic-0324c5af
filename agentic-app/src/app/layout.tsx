import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { FinanceProvider } from "@/components/finance/finance-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nexa Ledger",
  description: "Smart money management for tracking income, expenses, and transfers."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-950`}>
        <FinanceProvider>{children}</FinanceProvider>
      </body>
    </html>
  );
}
