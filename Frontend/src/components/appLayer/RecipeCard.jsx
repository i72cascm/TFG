import { Link } from "react-router-dom";
import { CircleUserRound, Clock, Users, Heart } from "lucide-react";
import { formatNumber, truncateText } from "../../utils/auxFunc";
import { useQuery } from "@tanstack/react-query";
import useLike from "../../hooks/mainApp/useLike";

function RecipeCard({ recipe }) {

    const { getTotalLikes } = useLike();

    const { data: totalLikes} = useQuery({
        queryKey: ["recipe-likes", recipe?.id],
        queryFn: () => getTotalLikes(recipe?.id),
        enabled: !!recipe, // Solo ejecutar la consulta cuando recipe está disponible
    });

    return (
        <div className="rounded-2xl" style={{ backgroundColor: "#00ADB5", zIndex: 800 }}>
            <Link to={`/app/recipe/${recipe.id}`}>
                <div className="relative">
                    <img
                        src={recipe.recipeImage}
                        alt="Recipe Image"
                        className="rounded-t-lg w-full h-52 object-cover"
                    />
                    <span className="absolute bottom-0 right-0 py-1 px-2 text-sm font-medium text-gray-900 rounded-l-lg mb-3" style={{ backgroundColor: "#00ADB5" }}>
                        {recipe.tagName}
                    </span>
                </div>
            </Link>
            <div>
                <h5 className="text-center mt-5 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {truncateText(recipe.title, 20)}
                </h5>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4 mt-2 p-2">
                <div className="flex flex-col items-center justify-center">
                    <CircleUserRound size={20} />
                    <p className="font-medium">{recipe.userName}</p>
                </div>
                <div className="flex flex-col items-center justify-center">
                    <Clock size={20} />
                    <p className="font-medium">{recipe.preparationTime} minutes</p>
                </div>
                <div className="flex flex-col items-center justify-center">
                    <Users size={20} />
                    <p className="font-medium">
                        Serves {recipe.servingsNumber} people
                    </p>
                </div>
                <div className="flex flex-col items-center justify-center">
                    <Heart size={20} />
                    <p className="font-medium">
                        {formatNumber(totalLikes)} Likes
                    </p>
                </div>
            </div>
            <div className="flex justify-center mb-5 mt-1">
                <Link
                    to={`/app/recipe/${recipe.id}`}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                    See Recipe
                </Link>
            </div>
        </div>
    );
}

export default RecipeCard;
