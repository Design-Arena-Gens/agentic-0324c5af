"use client";

import { useFinance } from "./finance-context";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function CategoryOverview() {
  const { categories, subcategories } = useFinance();

  const grouped = categories.reduce<Record<string, { name: string; type: string; children: string[] }>>(
    (acc, category) => {
      acc[category.id] = {
        name: category.name,
        type: category.type,
        children: subcategories
          .filter((sub) => sub.categoryId === category.id)
          .map((sub) => sub.name)
      };
      return acc;
    },
    {}
  );

  return (
    <Card className="border-slate-800/60 bg-slate-950/80">
      <CardHeader className="flex-col items-start gap-3">
        <Badge variant="muted">Structure</Badge>
        <CardTitle className="text-xl">Category Hierarchy</CardTitle>
        <CardDescription>Review your categories and associated subcategories.</CardDescription>
      </CardHeader>
      <div className="space-y-4">
        {Object.entries(grouped).map(([id, entry]) => (
          <div
            key={id}
            className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4 transition hover:border-brand/40"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-semibold text-slate-100">{entry.name}</h4>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {entry.type === "income" ? "Income" : "Expense"} category
                </p>
              </div>
              <Badge variant={entry.type === "income" ? "success" : "danger"}>
                {entry.type === "income" ? "Income" : "Expense"}
              </Badge>
            </div>
            {entry.children.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {entry.children.map((name) => (
                  <span
                    key={name}
                    className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-300"
                  >
                    {name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">No subcategories yet.</p>
            )}
          </div>
        ))}
        {Object.keys(grouped).length === 0 && (
          <p className="px-4 pb-6 text-sm text-slate-500">Create your first category to begin.</p>
        )}
      </div>
    </Card>
  );
}
