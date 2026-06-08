import { Bell, HelpCircle, Search } from "lucide-react";

function Header({ title, subtitle, badge, searchPlaceholder = "Search..." }) {
  return (
    <header className="flex items-start justify-between gap-4 mb-8 flex-wrap">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-3xl font-bold text-[#2F2F2F]">
            {title}
          </h1>
          {badge && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EDE4D4] text-[#6B5344] uppercase tracking-wide">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-[#8B8B8B] text-sm mt-1">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B8B8B]"
          />
          <input
            type="search"
            placeholder={searchPlaceholder}
            className="pl-10 pr-4 py-2.5 w-56 bg-white border border-[#E8E2D8] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#4E7D5A]/30"
          />
        </div>
        
      </div>
    </header>
  );
}

export default Header;
