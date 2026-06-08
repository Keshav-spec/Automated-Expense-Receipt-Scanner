import { useEffect, useState } from "react";
import { Bell, Shield, User, Wallet } from "lucide-react";
import Header from "../components/Header";

function Settings() {
  const username = localStorage.getItem("username") || "user";

  const [notifications, setNotifications] = useState(true);
  const [autoCategorize, setAutoCategorize] = useState(true);
  const [budget, setBudget] = useState(10000);

  useEffect(() => {
    const savedBudget = localStorage.getItem("monthly_budget");

    if (savedBudget) {
      setBudget(savedBudget);
    }
  }, []);

  const saveBudget = () => {
    localStorage.setItem("monthly_budget", budget);

    alert("Budget saved successfully");
  };

  return (
    <div>
      <Header title="Settings" subtitle="Manage your account preferences" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Profile */}

        <div className="bg-white rounded-3xl p-6 border border-[#E8E2D8] shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#E8F0E4] flex items-center justify-center">
              <User size={18} className="text-[#4E7D5A]" />
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold text-[#2F2F2F]">
                Profile
              </h2>

              <p className="text-sm text-[#8B8B8B]">
                Account information
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#8B8B8B] mb-2">
                Username
              </label>

              <input
                type="text"
                value={username}
                readOnly
                className="w-full px-4 py-3 bg-[#F7F4EE] border border-[#E8E2D8] rounded-2xl text-sm text-[#6B6B6B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#8B8B8B] mb-2">
                Role
              </label>

              <input
                type="text"
                value="Finance Manager"
                readOnly
                className="w-full px-4 py-3 bg-[#F7F4EE] border border-[#E8E2D8] rounded-2xl text-sm text-[#6B6B6B]"
              />
            </div>
          </div>
        </div>

        {/* Preferences */}

        <div className="bg-white rounded-3xl p-6 border border-[#E8E2D8] shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#E8F0E4] flex items-center justify-center">
              <Bell size={18} className="text-[#4E7D5A]" />
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold text-[#2F2F2F]">
                Preferences
              </h2>

              <p className="text-sm text-[#8B8B8B]">
                Notification & automation
              </p>
            </div>
          </div>

          <div className="space-y-5">
            

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-[#2F2F2F]">
                  Auto-categorize expenses
                </p>

                <p className="text-xs text-[#8B8B8B]">
                  Use AI to assign expense categories
                </p>
              </div>

              <input
                type="checkbox"
                checked={autoCategorize}
                onChange={(e) =>
                  setAutoCategorize(e.target.checked)
                }
                className="w-5 h-5 accent-[#4E7D5A] rounded"
              />
            </label>
          </div>
        </div>

        {/* Monthly Budget */}

        <div className="bg-white rounded-3xl p-6 border border-[#E8E2D8] shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#E8F0E4] flex items-center justify-center">
              <Wallet size={18} className="text-[#4E7D5A]" />
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold text-[#2F2F2F]">
                Monthly Budget
              </h2>

              <p className="text-sm text-[#8B8B8B]">
                Set your monthly spending limit
              </p>
            </div>
          </div>

          <label className="block text-xs font-semibold uppercase tracking-wider text-[#8B8B8B] mb-2">
            Budget Amount (₹)
          </label>

          <input
            type="number"
            value={budget}
            onChange={(e) =>
              setBudget(e.target.value)
            }
            className="
              w-full
              px-4
              py-3
              border
              border-[#E8E2D8]
              rounded-2xl
              text-sm
              text-[#2F2F2F]
              focus:outline-none
              focus:ring-2
              focus:ring-[#4E7D5A]
            "
          />

          <button
            onClick={saveBudget}
            className="
              mt-4
              px-5
              py-3
              bg-[#4E7D5A]
              hover:bg-[#3E6648]
              text-white
              rounded-2xl
              font-medium
              transition-all
            "
          >
            Save Budget
          </button>
        </div>

        {/* Security */}

        <div className="bg-white rounded-3xl p-6 border border-[#E8E2D8] shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#E8F0E4] flex items-center justify-center">
              <Shield size={18} className="text-[#4E7D5A]" />
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold text-[#2F2F2F]">
                Security
              </h2>

              <p className="text-sm text-[#8B8B8B]">
                Your data is encrypted and stored securely
              </p>
            </div>
          </div>

          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            Expensify AI uses JWT authentication and secure API endpoints.
            Receipt images are stored locally on the server and linked
            to your account only.
          </p>
        </div>

      </div>
    </div>
  );
}

export default Settings;