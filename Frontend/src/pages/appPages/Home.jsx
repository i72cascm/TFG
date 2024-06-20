import { useQuery } from "@tanstack/react-query";
import Searchbar from "../../components/appLayer/Searchbar";
import useRecipe from "../../hooks/mainApp/useRecipe";
import RecipeCard from "../../components/appLayer/RecipeCard";

const Home = () => {
    // Llamada de los métodos en el hook de recetas
    const { getAllRecipes } = useRecipe();

    // Al renderizar esta página, llamar al método de obtención de recetas y guardarlas en el array de listas
    const {
        data: recipeList,
        error,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["recipes"],
        queryFn: getAllRecipes,
        select: (data) => data?.data || [], // Accede a la propiedad 'data' del objeto y utiliza un array vacío como valor por defecto
        keepPreviousData: true,
    });

    const handleSearchSubmit = () => {
        console.log("Searching...");
    };

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
