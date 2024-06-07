import { useState, useEffect } from "react";
import RecipeCard from "../../components/appLayer/RecipeCard";
import useRecipe from "../../hooks/mainApp/useRecipe";

const MyRecipes = () => {
    // Llamada de los métodos en el hook de recetas
    const { getUserRecipes } = useRecipe();

    // Array de las recetas
    const [recipeList, setRecipeList] = useState([]);

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
    useEffect(() => {
        const loadMyRecipes = async () => {
            const result = await getUserRecipes(userData.email);
            if (result.success) {
                setRecipeList(result.data);
            } else {
                console.error("Failed to fetch user recipes:", result.message);
            }
        };

        loadMyRecipes();
    }, []);

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
