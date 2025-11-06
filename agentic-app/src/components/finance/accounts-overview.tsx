"use client";

import { PiggyBank, WalletCards } from "lucide-react";
import { useFinance } from "./finance-context";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { currency } from "@/lib/utils";

export function AccountsOverview() {
  const { accounts, currency: currencyCode } = useFinance();

  if (accounts.length === 0) {
    return null;
  }

  return (
    <Card className="border-slate-800/60 bg-slate-950/80">
      <CardHeader className="flex-col items-start gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase text-slate-400">
          <WalletCards className="h-4 w-4 text-brand" />
          Accounts
        </span>
        <CardTitle className="text-xl">Account Balances</CardTitle>
        <CardDescription>Current balance across cash, banks and cards.</CardDescription>
      </CardHeader>
      <div className="space-y-4">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="flex items-center justify-between rounded-2xl border border-slate-800/60 bg-slate-900/60 px-4 py-3 transition hover:border-brand/40"
          >
            <div className="flex items-center gap-3">
              <PiggyBank className="h-5 w-5 text-brand" />
              <div>
                <p className="text-sm font-semibold text-slate-100">{account.name}</p>
                <p className="text-xs text-slate-500">{account.currency}</p>
              </div>
            </div>
            <span className="text-base font-semibold text-slate-100">
              {currency(account.balance, currencyCode)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
