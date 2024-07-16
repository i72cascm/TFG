import { ChevronFirst, ChevronLast, LogOut, User } from "lucide-react";
import { createContext, useState } from "react";
import logo from "/logo.png";
import { SidebarItem } from "./SidebarItem";
import {
    Apple,
    Home,
    CookingPot,
    Receipt,
    ScrollText,
    LayoutDashboard,
    Settings,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import useSignOut from "react-auth-kit/hooks/useSignOut";

export const SidebarContext = createContext();

export default function Sidebar() {
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

    const [expanded, setExpanded] = useState(true);
    const location = useLocation();
    const signOut = useSignOut();
    const navigate = useNavigate();

    const isActive = (path) => location.pathname === path;

    // Función para manejar el cierre de sesión
    const handleLogout = () => {
        signOut(); // Cierra la sesión
        navigate("/");
    };

    return (
        <aside className="h-screen">
            <nav
                className="h-full flex flex-col border-r-2 border-black bg-slate-700"
                
            >
                <div className="p-4 pb-2 flex justify-between items-center">
                    <img
                        src={logo}
                        className={` overflow-hidden transition-all ${
                            expanded ? "w-56" : "w-0"
                        }`}
                    />
                    <div
                        style={{
                            display: "flex",
                            alignItems: "start",
                            height: "100%",
                        }}
                    >
                        <button
                            onClick={() => setExpanded((curr) => !curr)}
                            className="p-1.5 rounded-xl bg-gray-200 hover:bg-gray-200"
                        >
                            {expanded ? <ChevronFirst /> : <ChevronLast />}
                        </button>
                    </div>
                </div>

                <SidebarContext.Provider value={{ expanded }}>
                    <div className="flex-1 flex flex-col">
                        <ul className="px-3 flex-grow">
                            <SidebarItem
                                icon={<Home size={25} />}
                                text="Home Page"
                                to="/app/home"
                                active={isActive("/app/home")}
                            />
                            <SidebarItem
                                icon={<CookingPot size={25} />}
                                text="Recipe Builder"
                                to="/app/recipe-builder"
                                active={isActive("/app/recipe-builder")}
                            />
                            <SidebarItem
                                icon={<ScrollText size={25} />}
                                text="My Recipes"
                                to="/app/my-recipes"
                                active={isActive("/app/my-recipes")}
                            />
                            <SidebarItem
                                icon={<Receipt size={25} />}
                                text="Shopping List"
                                to="/app/shopping-lists"
                                active={isActive("/app/shopping-lists")}
                            />
                            <SidebarItem
                                icon={<LayoutDashboard size={25} />}
                                text="Weekly Planner"
                            />
                            <SidebarItem
                                icon={<Apple size={25} />}
                                text="Healthy Recipes"
                                to="/app/healthy-recipes"
                                active={isActive("/app/healthy-recipes")}
                            />
                            <hr
                                className="my-3"
                                style={{ borderTop: "1px solid #000000" }}
                            />
                            {userData && userData.name && (
                                <div className="flex items-center justify-center py-2 my-1 font-medium rounded-md h-12 text-gray-600 bg-gradient-to-tr from-gray-700 to-gray-400">
                                    {expanded ? (
                                        <p className="text-white">
                                            {userData.name}
                                        </p>
                                    ) : (
                                        <User size={25} color="white" />
                                    )}
                                </div>
                            )}
                            <SidebarItem
                                icon={<Settings size={25} />}
                                text="User Settings"
                                to="/app/user-settings"
                                active={isActive("/app/user-settings")}
                            />
                        </ul>

                        <div className="px-3 mb-3">
                            <SidebarItem
                                icon={<LogOut size={25} />}
                                text="Log Out"
                                onClick={handleLogout}
                                isLogOut={true}
                            />
                        </div>
                    </div>
                </SidebarContext.Provider>
            </nav>
        </aside>
    );
}
