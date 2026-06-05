import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";

function Register() {

    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");

    const handleRegister = async (e) => {

        e.preventDefault();

        try {

            await API.post(
                "/auth/register",
                null,
                {
                    params: {
                        username,
                        email,
                        password
                    }
                }
            );

            navigate("/login");

        } catch (err) {

            setError(
                err?.response?.data?.detail ||
                "Registration Failed"
            );
        }
    };

    return (

        <div className="min-h-screen bg-[#F7F4EE] flex items-center justify-center">

            <div className="bg-white p-10 rounded-3xl shadow-lg w-[420px]">

                <h1 className="text-3xl font-bold text-center text-[#355E3B] mb-8">
                    Create Account
                </h1>

                {error && (
                    <div className="bg-red-100 p-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister}>

                    <input
                        className="w-full border p-3 rounded-xl mb-4"
                        placeholder="Username"
                        value={username}
                        onChange={(e) =>
                            setUsername(e.target.value)
                        }
                    />

                    <input
                        className="w-full border p-3 rounded-xl mb-4"
                        placeholder="Email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                    />

                    <input
                        type="password"
                        className="w-full border p-3 rounded-xl mb-6"
                        placeholder="Password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                    />

                    <button
                        className="
                            w-full
                            bg-[#4E7D5A]
                            text-white
                            py-3
                            rounded-xl
                        "
                    >
                        Register
                    </button>

                </form>

                <div className="mt-6 text-center">

                    Already have an account?

                    <Link
                        className="ml-2 text-[#4E7D5A]"
                        to="/login"
                    >
                        Login
                    </Link>

                </div>

            </div>

        </div>
    );
}

export default Register;