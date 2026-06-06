import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, User } from "lucide-react";
import API from "../api/api";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const response = await API.post("/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("username", username);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err?.response?.data?.detail || "Invalid username or password"
      );
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
            Precise. Effortless. Intelligent.
          </p>
        </div>

        <div className="bg-[#FDFCF8] rounded-3xl shadow-2xl p-10 border border-[#E8E2D8]">
          <div className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-[#2F2F2F]">
              Welcome Back
            </h2>
            <p className="text-[#8B8B8B] text-sm mt-1">
              Access your financial dashboard
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-2xl mb-5 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
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
                  placeholder="Enter username"
                />
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-[#4E7D5A] hover:underline"
                >
                  Forgot?
                </button>
              </div>
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
                  placeholder="Enter password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#557A5C] hover:bg-[#355E3B] text-white py-3.5 rounded-2xl font-serif font-bold text-lg transition disabled:opacity-50"
            >
              {loading ? "Logging In..." : "Login"}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[#E8E2D8]" />
            <span className="text-xs text-[#8B8B8B] font-medium">OR</span>
            <div className="flex-1 h-px bg-[#E8E2D8]" />
          </div>

          <button
            type="button"
            className="w-full border border-dashed border-[#B0C4DE] bg-white py-3.5 rounded-2xl text-sm font-medium text-[#6B6B6B] hover:bg-[#F7F4EE] transition flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with SSO
          </button>

          <p className="mt-8 text-center text-sm text-[#6B6B6B]">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="text-[#4E7D5A] font-semibold hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
