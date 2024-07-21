import { useState } from "react";
import HealthyRecipeCard from "../../components/appLayer/HealthyRecipeCard";
import useHealthyRecipe from "../../hooks/mainApp/useHealthyRecipe";

const HealthyRecipes = () => {
    // Tags Seleccionadas
    const [selectedTags, setSelectedTags] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const [healthyRecipes, setHealthyRecipes] = useState([]);
    const [searchCompleted, setSearchCompleted] = useState(false);

    // Hook
    const { getHealthyRecipes } = useHealthyRecipe();

    // Cambiar tag de estado
    const toggleTag = (tag) => {
        setSelectedTags((prevTags) =>
            prevTags.includes(tag)
                ? prevTags.filter((t) => t !== tag)
                : [...prevTags, tag]
        );
    };

    // Cambiar estado de la búsqueda
    const handleInputChange = (event) => {
        setSearchInput(event.target.value);
    };

    // Selector de 6 recetas aleatorias de las que vienen de la API
    const selectRandomRecipes = (recipes, number) => {
        if (recipes.length <= number) {
            return recipes;
        }
        const indices = [...recipes.keys()];
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        return indices.slice(0, number).map((index) => recipes[index]);
    };

    // Realizar búsqueda
    const handleSearch = async () => {
        const result = await getHealthyRecipes(searchInput, selectedTags);
        if (result.success) {
            const randomRecipes = selectRandomRecipes(result.data, 6);
            setHealthyRecipes(randomRecipes);
            setSearchCompleted(true);
        } else {
            console.error(result.message);
            setHealthyRecipes([]);
            setSearchCompleted(true);
        }
    };

    // Tags disponibles para buscar
    const tags = [
        "balanced",
        "high-fiber",
        "high-protein",
        "low-carb",
        "low-fat",
        "low-sodium",
        "alcohol-cocktail",
        "alcohol-free",
        "celery-free",
        "crustacean-free",
        "egg-free",
        "fish-free",
        "gluten-free",
        "keto-friendly",
        "kidney-friendly",
        "low-potassium",
        "low-sugar",
        "lupine-free",
        "mollusk-free",
        "mustard-free",
        "no-oil-added",
        "peanut-free",
        "pescatarian",
        "red-meat-free",
        "sesame-free",
        "shellfish-free",
        "soy-free",
        "sugar-conscious",
        "sulfite-free",
        "tree-nut-free",
        "vegan",
        "vegetarian",
        "wheat-free",
    ];

    return (
        <>
            <div className="min-w-[1000px] overflow-x-auto">
                <div className="flex justify-center mt-2 mb-7">
                    <h1 className="text-sky-600 font-black text-7xl col-span-2 capitalize">
                        Search for{" "}
                        <span style={{ color: "#00ADB5" }}>
                            healthy recipes
                        </span>
                    </h1>
                </div>
                <div className="grid grid-cols-[4fr,1fr] gap-4 mx-4">
                    <div className="p-4 rounded-xl border-slate-700 bg-slate-700">
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 items-start m-8">
                            {healthyRecipes.length > 0
                                ? healthyRecipes.map((recipe, index) => (
                                      <HealthyRecipeCard
                                          key={index}
                                          recipe={recipe}
                                      />
                                  ))
                                : searchCompleted && (
                                      <div className="flex justify-center">
                                          <p className="text-white text-xl">
                                              No recipes found. Try different tags or search terms.
                                          </p>
                                      </div>
                                  )}
                        </div>
                    </div>
                    <div>
                        <div className="flex flex-col overflow-y-auto h-[73.8vh] gap-2 mb-4 p-4 rounded-xl border-slate-700 bg-slate-700">
                            <input
                                type="text"
                                placeholder="Search by Ingredient..."
                                className="text-center py-1 bg-slate-500 rounded-md border-2 border-gray-300 text-xl text-white placeholder:text-gray-300"
                                value={searchInput}
                                onChange={handleInputChange}
                            />
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag) => (
                                    <button
                                        key={tag}
                                        onClick={() => toggleTag(tag)}
                                        className={`capitalize rounded-md px-3 py-1 text-sm font-medium ${
                                            selectedTags.includes(tag)
                                                ? "bg-green-400"
                                                : "bg-gray-300 text-black"
                                        } transition duration-200 ease-in-out`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <button
                                className="w-full xl:h-[10vh] sm:h-[20vh] rounded-xl p-5 border-4 font-bold text-3xl bg-white/70 hover:bg-gray-100 active:bg-gray-400 transition duration-200 ease-in-out"
                                style={{ borderColor: "#222831" }}
                                onClick={handleSearch}
                            >
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HealthyRecipes;
