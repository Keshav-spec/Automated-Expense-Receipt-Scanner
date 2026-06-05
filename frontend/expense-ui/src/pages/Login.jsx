import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

            formData.append(
                "username",
                username
            );

            formData.append(
                "password",
                password
            );

            const response = await API.post(
                "/auth/login",
                formData,
                {
                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded"
                    }
                }
            );

            localStorage.setItem(
                "token",
                response.data.access_token
            );

            navigate("/dashboard");

        } catch (err) {

            setError(
                err?.response?.data?.detail ||
                "Invalid username or password"
            );

        } finally {

            setLoading(false);
        }
    };

    return (

        <div className="min-h-screen bg-[#F7F4EE] flex items-center justify-center p-6">

            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-10">

                {/* Logo */}

                <div className="text-center mb-8">

                    <div className="
                        w-16
                        h-16
                        mx-auto
                        rounded-full
                        bg-[#4E7D5A]
                        flex
                        items-center
                        justify-center
                        text-white
                        text-2xl
                        font-bold
                    ">
                        E
                    </div>

                    <h1 className="
                        mt-4
                        text-3xl
                        font-bold
                        text-[#355E3B]
                    ">
                        Expensify AI
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Smart Expense Tracking
                    </p>

                </div>

                {/* Heading */}

                <div className="mb-6">

                    <h2 className="
                        text-2xl
                        font-semibold
                        text-gray-800
                    ">
                        Welcome Back
                    </h2>

                    <p className="text-gray-500">
                        Sign in to continue
                    </p>

                </div>

                {/* Error Message */}

                {error && (

                    <div className="
                        bg-red-100
                        text-red-700
                        px-4
                        py-3
                        rounded-xl
                        mb-5
                    ">
                        {error}
                    </div>

                )}

                {/* Form */}

                <form onSubmit={handleLogin}>

                    <div className="mb-4">

                        <label className="
                            block
                            mb-2
                            text-sm
                            font-medium
                            text-gray-700
                        ">
                            Username
                        </label>

                        <input
                            type="text"
                            value={username}
                            onChange={(e) =>
                                setUsername(
                                    e.target.value
                                )
                            }
                            required
                            className="
                                w-full
                                border
                                border-gray-300
                                rounded-xl
                                px-4
                                py-3
                                focus:outline-none
                                focus:ring-2
                                focus:ring-[#4E7D5A]
                            "
                            placeholder="Enter username"
                        />

                    </div>

                    <div className="mb-6">

                        <label className="
                            block
                            mb-2
                            text-sm
                            font-medium
                            text-gray-700
                        ">
                            Password
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(
                                    e.target.value
                                )
                            }
                            required
                            className="
                                w-full
                                border
                                border-gray-300
                                rounded-xl
                                px-4
                                py-3
                                focus:outline-none
                                focus:ring-2
                                focus:ring-[#4E7D5A]
                            "
                            placeholder="Enter password"
                        />

                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="
                            w-full
                            bg-[#4E7D5A]
                            hover:bg-[#355E3B]
                            text-white
                            py-3
                            rounded-xl
                            font-semibold
                            transition
                            disabled:opacity-50
                        "
                    >

                        {loading
                            ? "Logging In..."
                            : "Login"}

                    </button>

                </form>

                {/* Register Link */}

                <div className="
                    mt-6
                    text-center
                    text-gray-600
                ">

                    Don't have an account?

                    <Link
                        to="/register"
                        className="
                            ml-2
                            text-[#4E7D5A]
                            font-semibold
                            hover:underline
                        "
                    >
                        Register
                    </Link>

                </div>

            </div>

        </div>
    );
}

export default Login;