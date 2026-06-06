import { getCategoryStyle } from "../styles/theme";

function Badge({ label, variant = "category" }) {
  if (variant === "status") {
    const isVerified = label === "Verified";
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
          isVerified
            ? "bg-[#E8F0E4] text-[#355E3B]"
            : "bg-[#EDE4D4] text-[#6B5344]"
        }`}
      >
        {label}
      </span>
    );
  }

  const style = getCategoryStyle(label);

  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {label}
    </span>
  );
}

export default Badge;
