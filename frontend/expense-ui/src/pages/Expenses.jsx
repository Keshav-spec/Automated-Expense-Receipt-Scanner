import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Camera,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Sparkles,
} from "lucide-react";
import Header from "../components/Header";
import Badge from "../components/Badge";
import API from "../api/api";
import {
  downloadCsv,
  formatCurrency,
  formatDate,
  getExpenseStatus,
} from "../utils/helpers";

const PAGE_SIZE = 10;

function Expenses() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await API.get("/receipts/");
        setExpenses(res.data);
      } catch {
        setExpenses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(expenses.map((e) => e.category).filter(Boolean));
    return ["All Categories", ...Array.from(cats).sort()];
  }, [expenses]);

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const matchSearch =
        !search ||
        e.merchant?.toLowerCase().includes(search.toLowerCase()) ||
        e.category?.toLowerCase().includes(search.toLowerCase());
      const matchCategory =
        categoryFilter === "All Categories" || e.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [expenses, search, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const topCategory = useMemo(() => {
    const totals = {};
    expenses.forEach((e) => {
      if (!e.amount) return;
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });
    return Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
  }, [expenses]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-[#8B8B8B]">
        Loading expenses...
      </div>
    );
  }

  return (
    <div>
      <Header title="Expenses List" searchPlaceholder="Search expenses..." />

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 bg-white border border-[#E8E2D8] rounded-2xl text-sm text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#4E7D5A]/30"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by merchant..."
          className="px-4 py-2.5 bg-white border border-[#E8E2D8] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4E7D5A]/30 flex-1 min-w-[200px]"
        />

        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E8E2D8] rounded-2xl text-sm text-[#6B6B6B] hover:bg-[#F3F0E9] transition-colors"
        >
          <Filter size={16} />
          Advanced Filters
        </button>

        <button
          type="button"
          onClick={() => downloadCsv(filtered)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4E7D5A] text-white rounded-2xl text-sm font-semibold hover:bg-[#355E3B] transition-colors ml-auto"
        >
          <Download size={16} />
          Download CSV
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-[#E8E2D8] shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E8E2D8] bg-[#FAFAF8]">
                {["ID", "DATE", "MERCHANT", "CATEGORY", "AMOUNT", "STATUS"].map(
                  (col) => (
                    <th
                      key={col}
                      className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#8B8B8B]"
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-[#8B8B8B]"
                  >
                    No expenses found. Upload a receipt to get started.
                  </td>
                </tr>
              ) : (
                paginated.map((expense) => (
                  <tr
                    key={expense.id}
                    className="border-b border-[#F3F0E9] hover:bg-[#FAFAF8] transition-colors"
                  >
                    <td className="px-6 py-4 text-[#8B8B8B] font-mono text-xs">
                      #{String(expense.id).padStart(4, "0")}
                    </td>
                    <td className="px-6 py-4 text-[#6B6B6B]">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-6 py-4 font-medium text-[#2F2F2F]">
                      {expense.merchant}
                    </td>
                    <td className="px-6 py-4">
                      <Badge label={expense.category || "Other"} />
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#2F2F2F]">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        label={getExpenseStatus(expense)}
                        variant="status"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E8E2D8]">
          <p className="text-sm text-[#8B8B8B]">
            Showing {paginated.length} of {filtered.length} results
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-full border border-[#E8E2D8] flex items-center justify-center text-[#6B6B6B] disabled:opacity-40 hover:bg-[#F3F0E9]"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(
              (p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-full text-sm font-medium ${
                    page === p
                      ? "bg-[#4E7D5A] text-white"
                      : "text-[#6B6B6B] hover:bg-[#F3F0E9]"
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 rounded-full border border-[#E8E2D8] flex items-center justify-center text-[#6B6B6B] disabled:opacity-40 hover:bg-[#F3F0E9]"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-[#E8E2D8] shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={18} className="text-[#4E7D5A]" />
            <h3 className="font-serif text-lg font-bold text-[#2F2F2F]">
              Smart Insights
            </h3>
          </div>
          <p className="text-sm text-[#6B6B6B] leading-relaxed mb-4">
            {topCategory
              ? `Your spending on ${topCategory[0]} totals ${formatCurrency(topCategory[1])} — your largest category this period.`
              : "Upload more receipts to unlock AI-powered spending insights."}
          </p>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#4E7D5A] hover:underline"
          >
            View Detailed Report
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#E8E2D8] shadow-sm">
          <h3 className="font-serif text-lg font-bold text-[#2F2F2F] mb-4">
            Quick Receipt Scan
          </h3>
          <button
            type="button"
            onClick={() => navigate("/upload")}
            className="w-full border-2 border-dashed border-[#D4CFC4] rounded-2xl p-8 text-center hover:border-[#4E7D5A] hover:bg-[#F0F7F2] transition-colors"
          >
            <Camera size={28} className="mx-auto text-[#4E7D5A] mb-3" />
            <p className="text-sm font-medium text-[#2F2F2F]">
              Drop image here
            </p>
            <p className="text-xs text-[#8B8B8B] mt-1">JPG, PNG up to 10MB</p>
          </button>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-[#8B8B8B] mb-2 uppercase tracking-wide">
              <span>Monthly Scans</span>
              <span>{expenses.length} / 50</span>
            </div>
            <div className="h-1.5 bg-[#F3F0E9] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4E7D5A] rounded-full"
                style={{ width: `${Math.min((expenses.length / 50) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Expenses;
