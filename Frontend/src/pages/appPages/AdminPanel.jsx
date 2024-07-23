import React, { useEffect, useState } from "react";
import AdminUsers from "../../components/appLayer/AdminUsers";
import AdminRecipes from "../../components/appLayer/AdminRecipes";
import useUserSettings from "../../hooks/mainApp/useUserSettings";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

const AdminPanel = () => {
    const getAuthState = () => {
        const cookieValue = document.cookie
            .split("; ")
            .find(row => row.startsWith("_auth_state="))
            ?.split("=")[1];

        if (!cookieValue) {
            return null;
        }

        try {
            const decodedValue = decodeURIComponent(cookieValue);
            return JSON.parse(decodedValue);
        } catch (error) {
            console.error("Error parsing auth state:", error);
            return null;
        }
    };
    const userData = getAuthState();
    const navigate = useNavigate();
    const { getUserByEmail } = useUserSettings();
    const [visibleComponent, setVisibleComponent] = useState(localStorage.getItem("visibleComponent") || "AdminUsers");

    // Al renderizar esta página, llamar al método de obtención de datos del usuario
    const { data: userInfo, isLoading, isError } = useQuery({
        queryKey: ['user', userData?.email],
        queryFn: () => getUserByEmail(userData?.email),
        keepPreviousData: true,
        enabled: !!userData?.email,
    });

    useEffect(() => {
        if (!isLoading && !isError) {
            if (userInfo.data.role !== "Admin") {
                navigate('/app/home'); // Redirige a Home si no es admin
            }
        }
    }, [userInfo, isLoading, isError, navigate]);

    useEffect(() => {
        localStorage.setItem("visibleComponent", visibleComponent);
    }, [visibleComponent]);

    return (
        <>
            <div className="min-w-[1000px] overflow-x-auto">
                <div className="flex justify-center mt-4 mb-4">
                    <button
                        className={`text-2xl px-4 py-1 w-64 rounded-l-xl border-y-2 border-l-2 ${
                            visibleComponent === "AdminUsers"
                                ? "bg-slate-500 text-white"
                                : "bg-slate-700 text-gray-300"
                        }`}
                        onClick={() => setVisibleComponent("AdminUsers")}
                    >
                        Users
                    </button>
                    <button
                        className={`text-2xl px-4 py-1 w-64 rounded-r-xl border-y-2 border-r-2 ${
                            visibleComponent === "AdminRecipes"
                                ? "bg-slate-500 text-white"
                                : "bg-slate-700 text-gray-300"
                        }`}
                        onClick={() => setVisibleComponent("AdminRecipes")}
                    >
                        Recipes
                    </button>
                </div>

                {visibleComponent === "AdminUsers" && <AdminUsers />}
                {visibleComponent === "AdminRecipes" && <AdminRecipes />}
            </div>
        </>
    );
};

export default AdminPanel;
