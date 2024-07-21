import React, { useEffect, useState } from "react";
import AdminUsers from "../../components/appLayer/AdminUsers";
import AdminRecipes from "../../components/appLayer/AdminRecipes";

const AdminPanel = () => {
    // Leer el estado inicial desde localStorage o usar 'AdminUsers' por defecto
    const [visibleComponent, setVisibleComponent] = useState(
        localStorage.getItem("visibleComponent") || "AdminUsers"
    );

    // Guardar el estado en localStorage cada vez que visibleComponent cambie
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
