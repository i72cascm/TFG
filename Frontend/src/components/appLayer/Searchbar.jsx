import { useEffect, useState } from "react";
import bannerSearch from "/bannerSearch.jpg";
import useRecipeTag from "../../hooks/mainApp/useRecipeTag";

const Searchbar = ({
    inputValue,
    onInputChange,
    sortByLikes,
    onSortByLikesChange,
    category,
    onCategoryChange,
    handleSubmitSearch
}) => {
    // Estados
    const [tags, setTags] = useState([]);

    // Hooks
    const { getAllRecipeTags } = useRecipeTag();

    // Pedir al back todos los tags de recetas
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const tagData = await getAllRecipeTags();
                if (tagData.success) {
                    setTags(tagData.data);
                } else {
                    toast.error("Failed to fetch recipe tags.");
                }
            } catch (error) {
                toast.error("Error fetching tags: " + error.message);
            }
        };

        fetchTags();
    }, []);

    return (
        <div
            className="flex flex-col justify-center items-center bg-white p-4"
            style={{
                width: "100%",
                maxWidth: "4xl",
                margin: "auto",
                backgroundImage: `url(${bannerSearch})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
            }}
        >
            <div className="w-full max-w-4xl mb-4 p-1">
                <div className="flex justify-center">
                    <input
                        type="text"
                        placeholder="Search by name..."
                        className="px-4 py-1 bg-slate-500 w-96 rounded-l-xl border-2 border-gray-300 text-2xl text-white placeholder:text-gray-200"
                        value={inputValue}
                        onChange={onInputChange}
                    />
                    <button
                        type="submit"
                        onClick={handleSubmitSearch}
                        className="bg-blue-600 text-white px-4 py-2 rounded-r-xl border-2 border-blue-300 hover:bg-blue-800 focus:outline-none"
                    >
                        Search
                    </button>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center w-full max-w-lg ">
                <div className="bg-slate-500 rounded-xl border-2 border-gray-300 text-white">
                    <label className="flex items-center space-x-2 rounded-md px-2 py-2 ">
                        <input
                            type="checkbox"
                            checked={sortByLikes}
                            onChange={onSortByLikesChange}
                            className="form-checkbox cursor-pointer"
                        />
                        <span className="font-semibold">
                            Filter by most likes
                        </span>
                    </label>
                </div>
                <div className="bg-slate-500 rounded-xl border-2 border-gray-300">
                    <select
                        value={category}
                        onChange={onCategoryChange}
                        className="bg-slate-500 font-semibold rounded-xl px-2 py-2 focus:outline-none cursor-pointer text-white text-center"
                    >
                        <option value="">Select Type of recipe</option>
                        {tags.map((tag) => (
                            <option
                                key={tag.recipeTagID}
                                value={tag.recipeTagID}
                            >
                                {tag.tagName}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default Searchbar;
