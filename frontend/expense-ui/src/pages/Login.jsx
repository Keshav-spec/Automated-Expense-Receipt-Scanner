import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, User } from "lucide-react";
import API from "../api/api";
import GoogleSignInButton from "../components/GoogleSignInButton";

function Login({ googleAuthEnabled = false }) {
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
      if (!err.response) {
        setError(
          "Cannot reach the server. Start the backend with: py -3.11 -m uvicorn backend.main:app --reload"
        );
      } else {
        const detail = err.response.data?.detail;
        setError(
          typeof detail === "string"
            ? detail
            : "Invalid username or password"
        );
      }
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

          {googleAuthEnabled ? (
            <GoogleSignInButton onError={setError} />
          ) : (
            <p className="text-center text-xs text-[#8B8B8B] bg-[#F7F4EE] border border-dashed border-[#E8E2D8] rounded-2xl py-3.5 px-4">
              Google sign-in: add{" "}
              <code className="text-[#355E3B]">VITE_GOOGLE_CLIENT_ID</code> to{" "}
              <code className="text-[#355E3B]">frontend/expense-ui/.env</code>
            </p>
          )}

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
