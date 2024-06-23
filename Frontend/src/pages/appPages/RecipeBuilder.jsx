import { useState, useEffect ,useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useRecipe from "../../hooks/mainApp/useRecipe";
import tableCreateRecipe from "/tableCreateRecipe.png";
import tableCreateRecipe2 from "/tableCreateRecipe2.png";
import useRecipeTag from "../../hooks/mainApp/useRecipeTag";

const RecipeBuilder = () => {
    // Llamada de los métodos en el hook de recetas
    const { postRecipeMutation } = useRecipe();
    const { getAllRecipeTags } = useRecipeTag();

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

    const [tags, setTags] = useState([]);
    const [formData, setFormData] = useState({
        title: "",
        preparationTime: "",
        servings: "",
        image: null,
        steps: "",
        ingredients: "",
        tags: 0,
        userEmail: userData ? userData.email : null,
    });

    const fileInputRef = useRef(null);

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (
            file &&
            (file.type === "image/png" ||
                file.type === "image/jpeg" ||
                file.type === "image/jpg")
        ) {
            updateImage(file);
        } else {
            toast.error("Please upload a PNG, JPEG or JPG image.");
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (
            file &&
            (file.type === "image/png" ||
                file.type === "image/jpeg" ||
                file.type === "image/jpg")
        ) {
            updateImage(file);
        }
    };

    const updateImage = (file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData((prev) => ({
                ...prev,
                image: reader.result,
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleButtonClick = (e) => {
        e.preventDefault();
        fileInputRef.current.click();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const requiredFields = [
            "title",
            "preparationTime",
            "servings",
            "ingredients",
            "steps",
            "tags",
            "image",
        ];
        const emptyField = requiredFields.some((field) => !formData[field]);

        if (emptyField) {
            toast.error("Please fill in all fields.");
        } else {
            // Construye el objeto de datos para la solicitud POST
            const recipeData = {
                UserEmail: formData.userEmail,
                Title: formData.title,
                PreparationTime: parseInt(formData.preparationTime),
                ServingsNumber: parseInt(formData.servings),
                RecipeImage: formData.image,
                Steps: formData.steps,
                Ingredients: formData.ingredients,
                RecipeTagID: formData.tags,
            };
            postRecipeMutation.mutate(recipeData, {
                onSuccess: () => {
                    toast.success("Recipe submitted successfully!");
                    setFormData({
                        title: "",
                        preparationTime: "",
                        servings: "",
                        image: null,
                        steps: "",
                        ingredients: "",
                        tags: 0,
                        userEmail: userData ? userData.email : null,
                    });
                },
                onError: () => {
                    toast.error(
                        `An error occurred while submitting the recipe: ${result.message}`
                    );
                },
            });
        }
    };

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <div className="flex justify-center mt-2 mb-7">
                <h1 className="text-sky-600 font-black text-7xl col-span-2 capitalize">
                    Create your own{" "}
                    <span style={{ color: "#00ADB5" }}>recipe</span>
                </h1>
            </div>

            <form
                onSubmit={handleSubmit}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-4 mx-4">
                    <div
                        className="mb-4 p-4 rounded-xl border-slate-700 bg-slate-700"
                        style={{
                            backgroundImage: `url(${tableCreateRecipe})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    >
                        <div className="mt-3 flex flex-col items-center">
                            <label
                                className="text-slate-800 font-black text-xl capitalize"
                                style={{
                                    backgroundColor:
                                        "rgba(255, 255, 255, 0.692)",
                                    padding: "5px 10px",
                                    borderRadius: "8px",
                                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                }}
                            >
                                Recipe Title
                            </label>
                            <input
                                name="title"
                                type="text"
                                autoComplete="off"
                                maxLength={50}
                                value={formData.title}
                                onChange={handleChange}
                                className="text-center mt-2 block w-2/4 px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div className="mt-3 grid grid-cols-2">
                            <div className="mt-3 flex flex-col items-center">
                                <label
                                    className="text-slate-800 font-black text-xl capitalize"
                                    style={{
                                        backgroundColor:
                                            "rgba(255, 255, 255, 0.692)",
                                        padding: "5px 10px",
                                        borderRadius: "8px",
                                        boxShadow:
                                            "0 2px 4px rgba(0, 0, 0, 0.1)",
                                    }}
                                >
                                    Duration (minutes)
                                </label>
                                <input
                                    name="preparationTime"
                                    type="number"
                                    min="0"
                                    max="9999"
                                    autoComplete="off"
                                    value={formData.preparationTime}
                                    onChange={handleChange}
                                    className="text-center mt-2 blockl w-2/3 px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>

                            <div className="mt-3 flex flex-col items-center">
                                <label
                                    className="text-slate-800 font-black text-xl capitalize"
                                    style={{
                                        backgroundColor:
                                            "rgba(255, 255, 255, 0.692)",
                                        padding: "5px 10px",
                                        borderRadius: "8px",
                                        boxShadow:
                                            "0 2px 4px rgba(0, 0, 0, 0.1)",
                                    }}
                                >
                                    Number of Servings
                                </label>
                                <input
                                    name="servings"
                                    type="number"
                                    min="0"
                                    max="50"
                                    autoComplete="off"
                                    value={formData.servings}
                                    onChange={handleChange}
                                    className="text-center mt-2 block w-2/3 px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex flex-col items-center">
                            <label
                                className="text-slate-800 font-black text-xl capitalize"
                                style={{
                                    backgroundColor:
                                        "rgba(255, 255, 255, 0.692)",
                                    padding: "5px 10px",
                                    borderRadius: "8px",
                                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                }}
                            >
                                Type of Recipe
                            </label>
                            <select
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                className="capitalize text-slate-700 font-bold text-center block w-5/6 mt-2 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 custom-select"
                            >
                                <option value="">Select Type of recipe</option>
                                {tags.map((tag) => (
                                    <option
                                        key={tag.recipeTagID}
                                        value={tag.recipeTagID}
                                    >
                                        {tag.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mt-2 flex flex-col items-center">
                            <input
                                name="image"
                                type="file"
                                accept=".png, .jpg, .jpeg"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                style={{ display: "none" }} // Ocultar input default
                            />

                            {formData.image ? (
                                <div className="border-2 border-dashed border-slate-300 mt-3">
                                    <img
                                        src={formData.image}
                                        alt="Preview"
                                        style={{
                                            width: "300px",
                                            height: "300px",
                                            objectFit: "cover",
                                        }}
                                    />
                                </div>
                            ) : (
                                <div
                                    style={{
                                        width: "300px",
                                        marginTop: "0.75rem",
                                        height: "300px",
                                        border: "2px dashed rgb(203 213 225)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <span className="text-slate-300 font-bold text-xl">
                                        Drag and Drop
                                    </span>
                                </div>
                            )}

                            <button
                                onClick={handleButtonClick}
                                className=" mt-5 ml-40 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Select an Image
                            </button>
                        </div>
                    </div>
                    <div
                        className="bg-slate-700 mb-4 p-4 rounded-xl border-slate-700"
                        style={{
                            backgroundImage: `url(${tableCreateRecipe2})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    >
                        <div className="mt-3 flex flex-col items-center">
                            <label
                                className="text-slate-800 font-black text-xl capitalize"
                                style={{
                                    backgroundColor:
                                        "rgba(255, 255, 255, 0.692)",
                                    padding: "5px 10px",
                                    borderRadius: "8px",
                                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                }}
                            >
                                Ingredients
                            </label>
                            <textarea
                                name="ingredients"
                                value={formData.ingredients}
                                onChange={handleChange}
                                className="resize-none mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                rows="5"
                            ></textarea>
                        </div>
                        <div className="mt-6 flex flex-col items-center">
                            <label
                                className="text-slate-800 font-black text-xl capitalize"
                                style={{
                                    backgroundColor:
                                        "rgba(255, 255, 255, 0.692)",
                                    padding: "5px 10px",
                                    borderRadius: "8px",
                                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                }}
                            >
                                Steps
                            </label>
                            <textarea
                                name="steps"
                                value={formData.steps}
                                onChange={handleChange}
                                className="resize-none mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                rows="13"
                            ></textarea>
                        </div>

                        <div className="mt-6 flex flex-col items-center">
                            <button
                                type="submit"
                                className="w-3/5 px-4 p-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-2xl font-semibold"
                                disabled={postRecipeMutation.isPending}
                            >
                                {postRecipeMutation.isPending
                                    ? "Submitting..."
                                    : "Create Recipe"}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
};

export default RecipeBuilder;
