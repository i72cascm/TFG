import { useQuery } from "@tanstack/react-query";
import RecipeCard from "../../components/appLayer/RecipeCard";
import useRecipe from "../../hooks/mainApp/useRecipe";
import { useState } from "react";

const MyRecipes = () => {
    // Llamada de los métodos en el hook de recetas
    const { getUserRecipes } = useRecipe();

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

    // Estados
    const [showPublish, setShowPublish] = useState(false);

    // Al renderizar esta página, llamar al método de obtención de recetas y guardarlas en el array de listas
    const {
        data: recipeList,
        error,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["user-recipes", userData?.email],
        queryFn: () => getUserRecipes(userData?.email),
        select: (data) => data?.data || [], // Accede a la propiedad 'data' del objeto y utiliza un array vacío como valor por defecto
    });

    // Mensaje de cargando recetas
    if (isLoading) {
        return (
            <div className="flex justify-center mt-6">
                <h1 className="text-3xl text-stone-300">Loading recipes... </h1>
            </div>
        );
    }

    // Mensaje en caso de fallo de carga de las recetas
    if (isError) {
        console.error("Failed to fetch recipes:", error.message);
        return (
            <div className="flex justify-center mt-6">
                <h1 className="text-3xl text-stone-300">
                    Failed to load recipes...{" "}
                </h1>
            </div>
        );
    }

    // Filtrar recetas según el estado de showPublish
    const filteredRecipes = recipeList.filter(recipe => recipe.isPublish === showPublish);

    return (
        <>
            <div className="flex justify-center mt-6">
                <button
                    className={`text-2xl px-4 py-1 w-64 rounded-l-xl border-y-2 border-l-2 ${
                        showPublish
                            ? "bg-slate-500 text-white"
                            : "bg-slate-700 text-gray-300"
                    }`}
                    onClick={() => setShowPublish(true)}
                >
                    Publish
                </button>
                <button
                    className={`text-2xl px-4 py-1 w-64 rounded-r-xl border-y-2 border-r-2 ${
                        !showPublish
                            ? "bg-slate-500 text-white"
                            : "bg-slate-700 text-gray-300"
                    }`}
                    onClick={() => setShowPublish(false)}
                >
                    Not Publish
                </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 items-start m-8">
                {filteredRecipes.map((recipe) => {
                    return <RecipeCard key={recipe.id} recipe={recipe} />;
                })}
            </div>
        </>
    );
};

export default MyRecipes;
