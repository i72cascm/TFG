import { useQuery } from "@tanstack/react-query";
import RecipeCard from "../../components/appLayer/RecipeCard";
import useRecipe from "../../hooks/mainApp/useRecipe";

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
                <h1 className="text-3xl text-stone-300">Failed to load recipes... </h1>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 items-start m-8">
                {recipeList.map((recipe) => {
                    return <RecipeCard key={recipe.id} recipe={recipe} />;
                })}
            </div>
        </>
    );
};

export default MyRecipes;
