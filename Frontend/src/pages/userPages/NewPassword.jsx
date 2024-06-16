import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Alert from "../../components/userLayer/Alert";
import useForgetPassword from "../../hooks/authUser/useForgetPassword";

const NewPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [searchParams] = useSearchParams();
    const [alert, setAlert] = useState({
        show: false,
        msgAlert: "",
        error: false,
    });
    const navigate = useNavigate();

    const token = searchParams.get("token");
    const email = searchParams.get("email");

    const { updatePassword } = useForgetPassword();

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Validación de formato de contraseña
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/;
        if (!passwordRegex.test(password)) {
            setAlert({
                show: true,
                msgAlert: "Your username must be 3 to 20 characters long, start and end with a letter or number, include underscores (no consecutive ones).",
                error: true,
            });
            return;
        }

        // Ambas contraseñas deben ser iguales
        if (password !== confirmPassword) {
            setAlert({
                show: true,
                msgAlert: "Passwords do not match",
                error: true,
            });
            return;
        }

        const result = await updatePassword(email, token, password);
        if (result.success) {
            navigate("/");
        } else {
            setAlert({ show: true, msgAlert: result.message, error: true });
        }

        navigate("/");
    };

    return (
        <>
            <h1 className="text-sky-600 font-black text-6xl capitalize">
                <span style={{ color: "#00ADB5" }}>Set New</span> password
            </h1>

            <form
                className="my-10 bg-white shadow rounded-lg px-10 py-5"
                onSubmit={handleSubmit}
            >
                <div className="my-2">
                    <label
                        className="uppercase text-gray-600 block text-xl font-bold"
                        htmlFor="password"
                    >
                        New Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Enter new password"
                        className="w-full mt-3 p-3 border rounded-xl bg-gray-50"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className="my-2">
                    <label
                        className="uppercase text-gray-600 block text-xl font-bold"
                        htmlFor="confirmPassword"
                    >
                        Confirm Password
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                        className="w-full mt-3 p-3 border rounded-xl bg-gray-50"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
                <input
                    type="submit"
                    value="Set New Password"
                    className="bg-sky-700 w-full py-3 mt-2 text-white uppercase font-bold rounded hover:cursor-pointer hover:bg-sky-800 transition-colors"
                />
                {alert.show && <Alert alert={alert} />}
            </form>

            <nav className="lg:flex lg:justify-between">
                <Link
                    className="block text-center my-5 text-slate-500 uppercase text-sm"
                    to="/"
                >
                    Go to login
                </Link>
            </nav>
        </>
    );
};

export default NewPassword;
