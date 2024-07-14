import { useInfiniteQuery } from "@tanstack/react-query";
import RecipeCard from "../../components/appLayer/RecipeCard";
import useRecipe from "../../hooks/mainApp/useRecipe";
import React, { useState, useEffect } from "react";

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
        data,
        error,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
        refetch,
    } = useInfiniteQuery({
        queryKey: ["user-recipes", userData?.email, showPublish],
        queryFn: ({ pageParam = 1 }) =>
            getUserRecipes(userData?.email, pageParam, showPublish),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.nextCursor;
        },
    });

    // Consulta se refresqua cada vez que showPublish cambie
    useEffect(() => {
        refetch();
    }, [showPublish, refetch]);

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
    return (
        <>
            <div className="flex justify-center mt-6">
                <button
                    className={`text-2xl px-4 py-1 w-64 rounded-l-xl border-y-2 border-l-2 ${
                        !showPublish
                            ? "bg-slate-500 text-white"
                            : "bg-slate-700 text-gray-300"
                    }`}
                    onClick={() => setShowPublish(false)}
                >
                    Not Publish
                </button>
                <button
                    className={`text-2xl px-4 py-1 w-64 rounded-r-xl border-y-2 border-r-2 ${
                        showPublish
                            ? "bg-slate-500 text-white"
                            : "bg-slate-700 text-gray-300"
                    }`}
                    onClick={() => setShowPublish(true)}
                >
                    Publish
                </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 items-start m-8">
                {data.pages.map((group, i) => (
                    <React.Fragment key={i}>
                        {group.data.map((recipe) => {
                            return (
                                <RecipeCard key={recipe.id} recipe={recipe} />
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
            <div className="flex justify-center mt-6">
                {hasNextPage && (
                    <button
                        onClick={() => fetchNextPage()}
                        disabled={!hasNextPage || isFetchingNextPage}
                        className={`text-2xl px-4 py-1 w-64 mb-4 ${
                            isFetchingNextPage
                                ? "bg-slate-700 text-gray-300"
                                : "bg-slate-500 text-white"
                        } rounded-lg`}
                    >
                        {isFetchingNextPage
                            ? "Loading more..."
                            : hasNextPage && "Load More"}
                    </button>
                )}
            </div>
        </>
    );
};

export default MyRecipes;
