"use client";

import { useMemo, useState } from "react";
import { useFinance } from "./finance-context";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { currency, formatDate } from "@/lib/utils";
import { ArrowDownRight, ArrowRightLeft, ArrowUpRight, Search } from "lucide-react";

const typeMeta = {
  income: { label: "Income", icon: ArrowUpRight, badge: "success" as const },
  expense: { label: "Expense", icon: ArrowDownRight, badge: "danger" as const },
  transfer: { label: "Transfer", icon: ArrowRightLeft, badge: "muted" as const }
};

export function TransactionsTable() {
  const { transactions, accounts, categories, subcategories, currency: currencyCode } = useFinance();
  const [filterType, setFilterType] = useState<"all" | "income" | "expense" | "transfer">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return transactions.filter((transaction) => {
      if (filterType !== "all" && transaction.type !== filterType) {
        return false;
      }
      if (!query.trim().length) {
        return true;
      }
      const account = accounts.find((a) => a.id === transaction.accountId)?.name ?? "";
      const category = categories.find((c) => c.id === transaction.categoryId)?.name ?? "";
      const subcategory = subcategories.find((sc) => sc.id === transaction.subcategoryId)?.name ?? "";
      const notes = transaction.notes ?? "";
      const targetAccount = transaction.toAccountId
        ? accounts.find((a) => a.id === transaction.toAccountId)?.name ?? ""
        : "";
      const haystack = [account, category, subcategory, notes, targetAccount]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query.toLowerCase());
    });
  }, [transactions, accounts, categories, subcategories, filterType, query]);

  return (
    <Card className="flex h-full flex-col gap-6">
      <CardHeader className="flex-col items-start gap-3">
        <Badge variant="default">Recent Activity</Badge>
        <CardTitle className="text-xl">Transaction Timeline</CardTitle>
        <CardDescription>Track income, expenses, and transfers at a glance.</CardDescription>
        <div className="flex w-full flex-wrap gap-3 pt-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              placeholder="Search by account, category, notes..."
              className="w-full rounded-lg border border-slate-800 bg-slate-900/70 py-2 pl-9 pr-3 text-sm text-slate-100 focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/50"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {(["all", "income", "expense", "transfer"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  filterType === type
                    ? "bg-brand text-slate-900"
                    : "bg-slate-900/60 text-slate-300 hover:bg-slate-900"
                }`}
              >
                {type === "all" ? "All" : typeMeta[type].label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <div className="scrollbar-thin flex-1 overflow-y-auto">
        <table className="min-w-full table-fixed border-separate border-spacing-y-2">
          <thead className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur">
            <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Account</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Notes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400">
                  No transactions recorded yet. Capture your first transaction using the quick
                  actions on the left.
                </td>
              </tr>
            )}
            {filtered.map((transaction) => {
              const meta = typeMeta[transaction.type];
              const Icon = meta.icon;
              const category = categories.find((c) => c.id === transaction.categoryId);
              const subcategory = subcategories.find((sc) => sc.id === transaction.subcategoryId);
              const account = accounts.find((a) => a.id === transaction.accountId);
              const target =
                transaction.toAccountId && accounts.find((a) => a.id === transaction.toAccountId);

              const amount =
                transaction.type === "expense"
                  ? -transaction.amount
                  : transaction.amount;

              return (
                <tr
                  key={transaction.id}
                  className="rounded-2xl border border-slate-800/60 bg-slate-950/50 font-medium text-sm text-slate-200 shadow-card transition hover:border-brand/50 hover:bg-slate-900/80"
                >
                  <td className="whitespace-nowrap px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`flex h-10 w-10 items-center justify-center rounded-full bg-slate-900`}>
                        <Icon className="h-5 w-5 text-brand" />
                      </span>
                      <div className="flex flex-col">
                        <span>{meta.label}</span>
                        {transaction.type === "transfer" && target && (
                          <span className="text-xs text-slate-500">to {target.name}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span>{category?.name ?? "—"}</span>
                      {subcategory && (
                        <span className="text-xs text-slate-500">{subcategory.name}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">{account?.name ?? "—"}</td>
                  <td
                    className={`px-4 py-4 font-semibold ${
                      transaction.type === "expense"
                        ? "text-danger"
                        : transaction.type === "transfer"
                          ? "text-slate-300"
                          : "text-success"
                    }`}
                  >
                    {currency(amount, currencyCode)}
                  </td>
                  <td className="px-4 py-4 text-slate-400">{formatDate(transaction.date)}</td>
                  <td className="px-4 py-4 text-slate-300">{transaction.notes ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
