import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import useForgetPassword from "../../hooks/authUser/useForgetPassword";
import Alert from "../../components/userLayer/Alert";

const ForgetPassword = () => {
    const [email, setEmail] = useState("");
    const [alert, setAlert] = useState({
        show: false,
        msgAlert: "",
        error: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);  // Nuevo estado para controlar el botón
    const navigate = useNavigate();
    const { requestResetPassword } = useForgetPassword();

    const handleLoginRedirect = () => {
        navigate("/");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);  // Deshabilitar el botón al iniciar la solicitud
        const result = await requestResetPassword(email);
        setIsSubmitting(false);  // Habilitar el botón nuevamente al recibir la respuesta
        if (result.success) {
            handleLoginRedirect();
        } else {
            setAlert({ show: true, msgAlert: result.message, error: true });
        }
    };

    return (
        <>
            <h1 className="text-sky-600 font-black text-6xl capitalize">
                <span style={{ color: "#00ADB5" }}>Reset</span> account password{" "}
            </h1>

            <form
                className="my-10 bg-white shadow rounded-lg px-10 py-5"
                onSubmit={handleSubmit}
            >
                <div className="my-2">
                    <label
                        className="uppercase text-gray-600 block text-xl font-bold"
                        htmlFor="email"
                    >
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        placeholder="Enter your Email"
                        className="w-full mt-3 p-3 border rounded-xl bg-gray-50"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <input
                    type="submit"
                    value="Reset Password"
                    className="bg-sky-700 w-full py-3 mt-2 text-white uppercase font-bold rounded hover:cursor-pointer hover:bg-sky-800 transition-colors"
                    disabled={isSubmitting}  // Utilizar el estado para deshabilitar el botón
                />
                {alert.show && <Alert alert={alert} />}
            </form>

            <nav className="lg:flex lg:justify-between">
                <Link
                    className="block text-center my-5 text-slate-500 uppercase text-sm"
                    to="/"
                >
                    Already have an account? Sign in
                </Link>

                <Link
                    className="block text-center my-5 text-slate-500 uppercase text-sm"
                    to="/sign-up"
                >
                    Don't have an account? Create an account
                </Link>
            </nav>
        </>
    );
};

export default ForgetPassword;
