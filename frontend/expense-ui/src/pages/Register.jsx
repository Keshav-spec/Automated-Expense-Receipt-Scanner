import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail, User } from "lucide-react";
import API from "../api/api";

function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await API.post("/auth/register", null, {
        params: { username, email, password },
      });
      navigate("/login");
    } catch (err) {
      setError(err?.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative"
      style={{
        background:
          "radial-gradient(circle at 20% 30%, rgba(78,125,90,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(139,115,85,0.12) 0%, transparent 50%), #1a1a1a",
      }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#4E7D5A] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            E
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#4E7D5A] mt-5">
            Expensify AI
          </h1>
          <p className="text-[#A0A0A0] text-sm mt-2 tracking-wide">
            Create your account
          </p>
        </div>

        <div className="bg-[#FDFCF8] rounded-3xl shadow-2xl p-10 border border-[#E8E2D8]">
          <div className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-[#2F2F2F]">
              Get Started
            </h2>
            <p className="text-[#8B8B8B] text-sm mt-1">
              Join Expensify AI today
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-2xl mb-5 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
                Username
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B8B8B]"
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full border border-[#E8E2D8] rounded-2xl pl-11 pr-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#4E7D5A]/30 text-sm"
                  placeholder="Choose a username"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B8B8B]"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-[#E8E2D8] rounded-2xl pl-11 pr-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#4E7D5A]/30 text-sm"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B8B8B]"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border border-[#E8E2D8] rounded-2xl pl-11 pr-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#4E7D5A]/30 text-sm"
                  placeholder="Create a password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#557A5C] hover:bg-[#355E3B] text-white py-3.5 rounded-2xl font-serif font-bold text-lg transition disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Register"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[#6B6B6B]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#4E7D5A] font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
