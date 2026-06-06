export function formatCurrency(amount) {
  if (amount == null || Number.isNaN(amount)) return "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

export function formatCompactCurrency(amount) {
  if (amount == null || Number.isNaN(amount)) return "₹0";
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}k`;
  }
  return formatCurrency(amount);
}

export function formatDate(dateStr) {
  if (!dateStr) return "—";
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getExpenseStatus(expense) {
  return expense.amount != null && expense.amount > 0 ? "Verified" : "Pending";
}

export function downloadCsv(expenses, filename = "expenses.csv") {
  const headers = ["ID", "Date", "Merchant", "Category", "Amount", "Status"];
  const rows = expenses.map((e) => [
    e.id,
    e.date,
    `"${(e.merchant || "").replace(/"/g, '""')}"`,
    e.category,
    e.amount != null && e.amount !== ""
      ? `"${formatCurrency(e.amount)}"`
      : "",
    getExpenseStatus(e),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function groupByMonth(expenses) {
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const totals = {};

  expenses.forEach((e) => {
    if (!e.amount || !e.date) return;
    const d = new Date(e.date);
    if (Number.isNaN(d.getTime())) return;
    const key = months[d.getMonth()];
    totals[key] = (totals[key] || 0) + e.amount;
  });

  const now = new Date();
  const result = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = months[d.getMonth()];
    result.push({ month: key, amount: totals[key] || 0 });
  }
  return result;
}

export function categoryBreakdown(expenses) {
  const totals = {};
  let total = 0;

  expenses.forEach((e) => {
    if (!e.amount) return;
    const cat = e.category || "Other";
    totals[cat] = (totals[cat] || 0) + e.amount;
    total += e.amount;
  });

  return Object.entries(totals)
    .map(([name, value]) => ({
      name,
      value,
      percent: total > 0 ? Math.round((value / total) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value);
}
