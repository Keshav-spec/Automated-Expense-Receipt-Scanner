import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Upload,
  Receipt,
  Settings,
  LogOut,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/upload", label: "Upload Receipt", icon: Upload },
  { to: "/expenses", label: "My Expenses", icon: Receipt },
  { to: "/settings", label: "Settings", icon: Settings },
];

function Sidebar() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "User";
  const displayName = username
    .split(/[._]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <aside className="w-64 min-h-screen bg-[#F3F0E9] border-r border-[#E8E2D8] flex flex-col px-5 py-8 shrink-0">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-[#355E3B]">
          Expensify AI
        </h1>
      </div>

      <div className="flex items-center gap-3 bg-white/70 rounded-2xl px-4 py-3 mb-8 border border-[#E8E2D8]">
        <div className="w-10 h-10 rounded-full bg-[#4E7D5A] flex items-center justify-center text-white font-semibold text-sm shrink-0">
          {displayName.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-sm text-[#2F2F2F] truncate">
            {displayName}
          </p>
          <p className="text-xs text-[#8B8B8B]">Finance Manager</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#E8F0E4] text-[#355E3B] border-l-4 border-[#4E7D5A]"
                  : "text-[#6B6B6B] hover:bg-white/60 hover:text-[#355E3B]"
              }`
            }
          >
            <Icon size={18} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 mt-6 rounded-2xl text-sm font-medium text-[#6B6B6B] border border-dashed border-[#C5BFB5] hover:bg-white/60 hover:text-[#355E3B] transition-colors w-full"
      >
        <LogOut size={18} strokeWidth={1.75} />
        Logout
      </button>
    </aside>
  );
}

export default Sidebar;
