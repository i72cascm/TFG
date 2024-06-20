import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useUserSettings from "../../hooks/mainApp/useUserSettings";
import useForgetPassword from "../../hooks/authUser/useForgetPassword";
import Modal from "react-modal";
import useRecipe from "../../hooks/mainApp/useRecipe";
import useSignOut from "react-auth-kit/hooks/useSignOut";
import { useNavigate } from "react-router-dom";

// Estilos del modal
const customStyles = {
    content: {
        top: "50%",
        left: "50%",
        right: "auto",
        bottom: "auto",
        marginRight: "-50%",
        transform: "translate(-50%, -50%)",
        padding: "0%",
    },
};

Modal.setAppElement("#root");

const UserSettings = () => {
    const getAuthState = () => {
        // Obtener el valor de la cookie por su nombre
        const cookieValue = document.cookie
            .split("; ")
            .find((row) => row.startsWith("_auth_state="))
            ?.split("=")[1];

        if (!cookieValue) {
            return null;
        }

        // Decodificar el valor URL-encoded de la cookie y parsearlo como JSON
        try {
            const decodedValue = decodeURIComponent(cookieValue);
            const authState = JSON.parse(decodedValue);
            return authState;
        } catch (error) {
            console.error("Error parsing auth state:", error);
            return null;
        }
    };
    const userData = getAuthState();

    // Para deslogear en caso de eliminar cuenta
    const signOut = useSignOut();
    const navigate = useNavigate();

    // Estado para controlar los modales
    const [modalDeleteAccount, setModalDeleteAccount] = useState(false);
    const [modalDeleteRecipes, setModalDeleteRecipes] = useState(false);

    // Funciones para abrir y cerrar los modales
    const openDeleteAccountModal = () => setModalDeleteAccount(true);
    const closeDeleteAccountModal = () => setModalDeleteAccount(false);
    const openDeleteRecipesModal = () => setModalDeleteRecipes(true);
    const closeDeleteRecipesModal = () => setModalDeleteRecipes(false);

    // Llamada de los métodos en el hook de userSettings
    const { getUserByEmail, putUserMutation, deleteUserMutation } = useUserSettings();
    const { requestResetPassword } = useForgetPassword();
    const { deleteAllRecipesByUserMutation } = useRecipe();

    // Al renderizar esta página, llamar al método de obtención de datos del usuario
    const { data } = useQuery({
        queryKey: ["user-settings"],
        queryFn: () => getUserByEmail(userData?.email),
        keepPreviousData: true,
        enabled: !!userData?.email,
    });

    const [formData, setFormData] = useState({
        name: "",
        lastNames: "",
        userName: "",
        birthDate: "",
    });

    const [formOriginalData, setOriginalFormData] = useState({
        name: "",
        lastNames: "",
        userName: "",
        birthDate: "",
    });

    useEffect(() => {
        if (data && data.success) {
            const user = data.data;
            setFormData({
                name: user.name || "",
                lastNames: user.lastNames || "",
                userName: user.userName || "",
                birthDate: user.birthDate || "",
            });
            setOriginalFormData({
                name: user.name || "",
                lastNames: user.lastNames || "",
                userName: user.userName || "",
                birthDate: user.birthDate || "",
            });
        }
    }, [data]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleDeleteRecipes = () => {
        deleteAllRecipesByUserMutation.mutate(userData.email, {
            onSuccess: () => {
                toast.info("All recipes have been deleted.");
            },
            onError: (error) => {
                toast.error(
                    `An error occurred while deleting recipes: ${error.message}`
                );
            },
        });
        closeDeleteRecipesModal();
    };

    const handleDeleteAccount = () => {
        deleteUserMutation.mutate(userData.email, {
            onSuccess: () => {
                toast.error("User account has been deleted.");
            },
            onError: (error) => {
                toast.error(
                    `An error occurred while deleting user: ${error.message}`
                );
            },
        });
        closeDeleteAccountModal();
        signOut(); // Cierra la sesión
        navigate("/"); // Llevar al login
        
    };

    const hasFormChanged = () => {
        return (
            formData.name !== formOriginalData.name ||
            formData.lastNames !== formOriginalData.lastNames ||
            formData.userName !== formOriginalData.userName ||
            formData.birthDate !== formOriginalData.birthDate
        );
    };

    const validateBirthDate = (birthDate) => {
        const dateFormat = new Date(birthDate);
        const now = new Date();
        const userAge = new Date(
            now.getFullYear() - 18,
            now.getMonth(),
            now.getDate()
        );
        const old = new Date("1900-01-01");
        if (dateFormat <= old || dateFormat >= userAge) {
            return "Invalid age";
        }
        return null;
    };

    const validateUsername = (username) => {
        if (
            !(username.length >= 3 && username.length <= 20) ||
            !/^[a-zA-Z0-9]+[a-zA-Z0-9_]*[a-zA-Z0-9]+$/.test(username) ||
            /.*__+.*/.test(username)
        ) {
            return "The username is invalid: Your username must be 3 to 20 characters long, start and end with a letter or number, include underscores (no consecutive ones).";
        }
        return null;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const requiredFields = ["name", "lastNames", "userName", "birthDate"];
        const emptyField = requiredFields.some((field) => !formData[field]);

        if (emptyField) {
            toast.error("Please fill in all fields.");
            return;
        }

        const birthDateError = validateBirthDate(formData.birthDate);
        if (birthDateError) {
            toast.error(birthDateError);
            return;
        }

        const usernameError = validateUsername(formData.userName);
        if (usernameError) {
            toast.error(usernameError);
            return;
        }

        putUserMutation.mutate(
            { email: userData.email, userData: formData },
            {
                onSuccess: () => {
                    toast.success("Settings updated successfully!");
                },
                onError: (error) => {
                    toast.error(
                        `An error occurred while submitting the recipe: ${error.message}`
                    );
                },
            }
        );
    };

    const handleChangePassword = async (event) => {
        event.preventDefault();
        await requestResetPassword(userData.email);
        toast.success("Check your email.");
    };

    return (
        <>
            <Modal
                isOpen={modalDeleteAccount}
                onRequestClose={closeDeleteAccountModal}
                style={customStyles}
                contentLabel="Delete Account Modal"
            >
                <div className="bg-red-100 p-5">
                    <h2 className="text-center font-bold text-2xl">Warning</h2>
                    <p className="mt-3 font-medium">
                        Are you sure you want to delete your account? This
                        action cannot be undone.
                    </p>
                    <div className="flex justify-center gap-24 mt-4">
                        <button
                            onClick={closeDeleteAccountModal}
                            className="px-4 py-2 text-white rounded font-semibold bg-gray-500 hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteAccount}
                            className="px-4 py-2 text-white rounded font-semibold bg-red-500 hover:bg-red-600"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={modalDeleteRecipes}
                onRequestClose={closeDeleteRecipesModal}
                style={customStyles}
                contentLabel="Delete Recipes Modal"
            >
                <div className="bg-red-100 p-5">
                    <h2 className="text-center font-bold text-2xl">Warning</h2>
                    <p className="mt-3 font-medium">
                        Are you sure you want to delete all recipes? This action
                        cannot be undone.
                    </p>
                    <div className="flex justify-center gap-24 mt-4">
                        <button
                            onClick={closeDeleteRecipesModal}
                            className="px-4 py-2 text-white rounded font-semibold bg-gray-500 hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteRecipes}
                            className="px-4 py-2 text-white rounded font-semibold bg-red-500 hover:bg-red-600"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>

            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <div className="flex justify-center mt-2 mb-7">
                <h1 className="text-sky-600 font-black text-7xl">
                    User Settings
                </h1>
            </div>
            <div className="flex flex-col md:flex-row justify-center items-stretch md:space-x-4">
                <form
                    onSubmit={handleSubmit}
                    className="flex-auto p-5 bg-gray-200 shadow-md rounded-lg max-w-lg"
                >
                    <div className="grid grid-cols-1 gap-6">
                        <div className="flex flex-col items-center">
                            <label className="font-bold text-gray-700">
                                Email
                            </label>
                            <p className="w-4/6 p-2 mt-2 border rounded-md text-center font-semibold bg-gray-200">
                                {userData.email}
                            </p>
                        </div>
                        {[
                            { label: "Name", type: "text", name: "name" },
                            {
                                label: "Last Name",
                                type: "text",
                                name: "lastNames",
                            },
                            {
                                label: "Username",
                                type: "text",
                                name: "userName",
                            },
                            {
                                label: "Birth Date",
                                type: "date",
                                name: "birthDate",
                            },
                        ].map((field) => (
                            <div
                                key={field.name}
                                className="flex flex-col items-center"
                            >
                                <label className="font-bold text-gray-700">
                                    {field.label}
                                </label>
                                <input
                                    type={field.type}
                                    name={field.name}
                                    autoComplete="off"
                                    value={formData[field.name]}
                                    onChange={handleChange}
                                    className="w-4/6 p-2 mt-2 border rounded-md text-center font-medium"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col items-center md:flex-row justify-center">
                        <button
                            type="button"
                            onClick={handleChangePassword}
                            className="mt-6 md:mr-2 px-4 py-2 text-white rounded font-semibold bg-blue-500 hover:bg-blue-600"
                        >
                            Change Password
                        </button>
                        <button
                            type="submit"
                            className={`mt-6 md:ml-2 px-4 py-2 text-white rounded font-semibold ${
                                hasFormChanged()
                                    ? "bg-blue-500 hover:bg-blue-600"
                                    : "bg-gray-300 cursor-not-allowed"
                            }`}
                            disabled={
                                !hasFormChanged() || putUserMutation.isPending
                            }
                        >
                            Update Settings
                        </button>
                    </div>
                </form>
                <div>
                    <div className="flex-auto mt-6 md:mt-0 p-5 bg-yellow-100 shadow-md rounded-lg max-w-lg mb-4">
                        <h2 className="text-blue-500 font-bold text-xl text-center">
                            User Interests
                        </h2>
                        <p className="text-gray-700 text-center font-semibold">
                            Recipes you are interested in
                        </p>
                    </div>
                    <div className="flex-auto mt-6 md:mt-0 p-5 bg-red-100 shadow-md rounded-lg max-w-lg">
                        <h2 className="text-red-600 font-bold text-xl text-center">
                            Danger Zone
                        </h2>
                        <p className="text-gray-700 text-center font-semibold">
                            These actions cannot be undone. Please proceed with
                            caution.
                        </p>
                        <div className="flex flex-col items-center">
                            <button
                                onClick={openDeleteRecipesModal}
                                className="mt-4 w-7/12 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-semibold"
                            >
                                Delete All Recipes
                            </button>
                            <button
                                onClick={openDeleteAccountModal}
                                className="mt-4 w-7/12 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-semibold"
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UserSettings;
