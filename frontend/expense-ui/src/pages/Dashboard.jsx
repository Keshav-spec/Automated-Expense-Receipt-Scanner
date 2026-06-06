import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDownRight, ArrowUpRight, Sparkles } from "lucide-react";
import Header from "../components/Header";
import API from "../api/api";
import { chartColors } from "../styles/theme";
import {
  categoryBreakdown,
  formatCompactCurrency,
  formatCurrency,
  groupByMonth,
} from "../utils/helpers";

function MetricCard({ label, value, trend, trendUp, subtext, barPercent }) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-[#E8E2D8] shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#8B8B8B] mb-2">
        {label}
      </p>
      <div className="flex items-end justify-between gap-2">
        <p className="font-serif text-3xl font-bold text-[#355E3B]">{value}</p>
        {trend && (
          <span
            className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full ${
              trendUp
                ? "bg-[#E8F0E4] text-[#355E3B]"
                : "bg-[#F5E0DC] text-[#C45C4A]"
            }`}
          >
            {trendUp ? (
              <ArrowUpRight size={14} />
            ) : (
              <ArrowDownRight size={14} />
            )}
            {trend}
          </span>
        )}
      </div>
      {subtext && (
        <p className="text-xs text-[#8B8B8B] mt-2">{subtext}</p>
      )}
      {barPercent != null && (
        <div className="mt-4 h-1.5 bg-[#F3F0E9] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#4E7D5A] rounded-full transition-all"
            style={{ width: `${Math.min(barPercent, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [chartMode, setChartMode] = useState("monthly");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expRes, sumRes] = await Promise.all([
          API.get("/receipts/"),
          API.get("/analytics/summary"),
        ]);
        setExpenses(expRes.data);
        setSummary(sumRes.data);
      } catch {
        setExpenses([]);
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const monthlyData = groupByMonth(expenses);
  const categories = categoryBreakdown(expenses);
  const totalSpend = summary?.total_expenses || 0;
  const count = summary?.expense_count || 0;
  const avgSpend = count > 0 ? totalSpend / count : 0;

  const donutData =
    categories.length > 0
      ? categories.slice(0, 4)
      : [{ name: "No data", value: 1, percent: 100 }];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-[#8B8B8B]">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Financial Overview"
        badge="Live"
        searchPlaceholder="Search analytics..."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <MetricCard
          label="Total Spend"
          value={formatCurrency(totalSpend)}
          trend="12%"
          trendUp
          barPercent={72}
        />
        <MetricCard
          label="Receipt Count"
          value={String(count)}
          subtext="Verified receipts"
          barPercent={count > 0 ? 85 : 0}
        />
        <MetricCard
          label="Average Spend"
          value={formatCurrency(avgSpend)}
          trend="4%"
          trendUp={false}
          subtext="Target: ₹75.00"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#E8E2D8] shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#2F2F2F]">
                Monthly Spending
              </h2>
              <p className="text-sm text-[#8B8B8B]">Last 6 months comparison</p>
            </div>
            <div className="flex bg-[#F3F0E9] rounded-full p-1">
              {["quarterly", "monthly"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setChartMode(mode)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                    chartMode === mode
                      ? "bg-[#4E7D5A] text-white"
                      : "text-[#6B6B6B]"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="terraGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4E7D5A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4E7D5A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#8B8B8B", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#8B8B8B", fontSize: 12 }}
                tickFormatter={(v) => `₹${v}`}
              />
              <Tooltip
                formatter={(v) => [formatCurrency(v), "Spent"]}
                contentStyle={{ borderRadius: 12 }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#4E7D5A"
                strokeWidth={2}
                fill="url(#terraGreen)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#E8E2D8] shadow-sm">
          <h2 className="font-serif text-xl font-bold text-[#2F2F2F] mb-1">
            Spending by Category
          </h2>
          <p className="text-sm text-[#8B8B8B] mb-4">Distribution breakdown</p>
          <div className="relative">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {donutData.map((_, i) => (
                    <Cell
                      key={`cell-${i}`}
                      fill={chartColors[i % chartColors.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-xs text-[#8B8B8B] uppercase">Total</p>
                <p className="font-serif font-bold text-[#355E3B]">
                  {totalSpend >= 1000
                    ? formatCompactCurrency(totalSpend)
                    : formatCurrency(totalSpend)}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-2 mt-2">
            {donutData.map((cat, i) => (
              <div key={cat.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: chartColors[i % chartColors.length] }}
                  />
                  <span className="text-[#6B6B6B]">{cat.name}</span>
                </div>
                <span className="font-medium text-[#2F2F2F]">
                  {cat.percent ?? 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#2F2F2F] rounded-3xl p-6 border border-[#3A3A3A]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl font-bold text-white">
            Recent Analysis
          </h2>
          <button
            type="button"
            className="text-sm text-[#A8C5A0] hover:underline"
          >
            View All
          </button>
        </div>
        <div className="flex items-center gap-3 bg-[#3A3A3A] rounded-2xl px-5 py-4">
          <Sparkles size={18} className="text-[#A8C5A0] shrink-0" />
          <p className="text-sm text-[#D4D0C8]">
            AI Receipt Scanning Active —{" "}
            {count > 0
              ? `Processing ${count} expense${count !== 1 ? "s" : ""} in your queue.`
              : "Upload receipts to start automated analysis."}
          </p>
          <button
            type="button"
            className="ml-auto shrink-0 px-5 py-2 rounded-full bg-[#4E7D5A] text-white text-sm font-medium hover:bg-[#355E3B] transition-colors"
          >
            Review Queue
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
