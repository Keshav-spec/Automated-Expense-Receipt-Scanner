import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

function GoogleSignInButton({ onError }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSuccess = async (credentialResponse) => {
    setLoading(true);
    onError("");

    try {
      const response = await API.post("/auth/google", {
        id_token: credentialResponse.credential,
      });

      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("username", response.data.username);
      navigate("/dashboard");
    } catch (err) {
      if (!err.response) {
        onError(
          "Cannot reach the server. Start the backend with: py -3.11 -m uvicorn backend.main:app --reload"
        );
      } else {
        onError(
          err.response.data?.detail ||
            "Google sign-in failed. Check your Google OAuth setup."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-2 google-signin-wrapper">
      {loading && (
        <p className="text-sm text-[#6B6B6B]">Signing in with Google...</p>
      )}
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => onError("Google sign-in was cancelled or failed.")}
        theme="outline"
        size="large"
        text="continue_with"
        shape="rectangular"
        width="360"
      />
    </div>
  );
}

export default GoogleSignInButton;
