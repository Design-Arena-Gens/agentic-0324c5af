"use client";

import { ArrowDownCircle, ArrowRightLeft, ArrowUpCircle, Wallet } from "lucide-react";
import { type ComponentProps, type ComponentType, type SVGProps, useMemo } from "react";
import { useFinance } from "./finance-context";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { currency } from "@/lib/utils";

interface Metric {
  label: string;
  value: number;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  variant: "income" | "expense" | "transfer" | "balance";
}

const variantMap: Record<Metric["variant"], { badge: ComponentProps<typeof Badge>["variant"] }> =
  {
    income: { badge: "success" },
    expense: { badge: "danger" },
    transfer: { badge: "muted" },
    balance: { badge: "default" }
  };

export function SummaryCards() {
  const { transactions, accounts, currency: currencyCode } = useFinance();

  const metrics = useMemo<Metric[]>(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);
    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);
    const transfer = transactions
      .filter((t) => t.type === "transfer")
      .reduce((sum, tx) => sum + tx.amount, 0);
    const balance = accounts.reduce((sum, account) => sum + account.balance, 0);

    return [
      { label: "Total Income", value: income, icon: ArrowUpCircle, variant: "income" },
      { label: "Total Expense", value: expense, icon: ArrowDownCircle, variant: "expense" },
      { label: "Transfers", value: transfer, icon: ArrowRightLeft, variant: "transfer" },
      { label: "Net Balance", value: balance, icon: Wallet, variant: "balance" }
    ];
  }, [transactions, accounts]);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <Card
          key={metric.label}
          className="group overflow-hidden border-slate-800/60 bg-gradient-to-br from-slate-900/80 to-slate-950/90"
        >
          <CardHeader className="items-start justify-start gap-3">
            <Badge variant={variantMap[metric.variant].badge}>{metric.label}</Badge>
          </CardHeader>
          <div className="flex items-end justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">
                {currency(metric.value, currencyCode || "INR")}
              </CardTitle>
              <CardDescription className="mt-2">
                {metric.variant === "balance"
                  ? "Across all accounts"
                  : metric.variant === "transfer"
                    ? "Money moved between accounts"
                    : metric.variant === "income"
                      ? "Earnings captured in the period"
                      : "Spending recorded so far"}
              </CardDescription>
            </div>
            <metric.icon className="h-12 w-12 text-slate-600 transition group-hover:text-brand" />
          </div>
        </Card>
      ))}
    </div>
  );
}
