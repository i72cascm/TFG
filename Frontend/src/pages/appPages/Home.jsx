import { useState, useEffect } from "react";
import Searchbar from "../../components/appLayer/Searchbar";
import useRecipe from "../../hooks/mainApp/useRecipe";
import RecipeCard from "../../components/appLayer/RecipeCard";

const Home = () => {
    // Llamada de los métodos en el hook de recetas
    const { getAllRecipes } = useRecipe();

    // Array de las recetas
    const [recipeList, setRecipeList] = useState([]);

    // Al renderizar esta página, llamar al método de obtención de recetas y guardarlas en el array de listas
    useEffect(() => {
        const loadMyRecipes = async () => {
            const result = await getAllRecipes();
            if (result.success) {
                setRecipeList(result.data);
            } else {
                console.error("Failed to fetch recipes:", result.message);
            }
        };

        loadMyRecipes();
    }, []);

    const handleSearchSubmit = () => {
        console.log("Searching...");
    };

    return (
        <>
            <Searchbar onClick={handleSearchSubmit} />

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 items-start m-8">
                {recipeList.map((recipe) => {
                    return <RecipeCard key={recipe.id} recipe={recipe} />;
                })}
            </div>
        </>
    );
};

export default Home;
