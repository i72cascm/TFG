import { useState, useEffect, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useRecipe from "../../hooks/mainApp/useRecipe";
import tableCreateRecipe from "/tableCreateRecipe.png";
import tableCreateRecipe2 from "/tableCreateRecipe2.png";
import useRecipeTag from "../../hooks/mainApp/useRecipeTag";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "@chakra-ui/react";
import Modal from "react-modal";
import { InfoIcon } from "lucide-react";
import { useParams } from "react-router-dom";

// Estilo del modal
const customStyles = {
    content: {
        top: "50%",
        left: "50%",
        right: "auto",
        bottom: "auto",
        marginRight: "-50%",
        transform: "translate(-50%, -50%)",
        maxWidth: "90%",
        maxHeight: "90%",
        padding: 0,
        overflow: "hidden",
        zIndex: 1000,
    },
    overlay: {
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        zIndex: 999,
    },
};

const RecipeBuilder = () => {
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

    // Hooks
    const { putApproveRecipeMutation, getRecipeById, deleteRecipeMutation } =
        useRecipe();
    const { getAllRecipeTags } = useRecipeTag();

    // Estados
    const navigate = useNavigate();
    const { id } = useParams();
    const [tags, setTags] = useState([]);
    const [modalDeleteRecipe, setModalDeleteRecipe] = useState(false);
    const openDeleteRecipeModal = () => setModalDeleteRecipe(true);
    const closeDeleteRecipeModal = () => setModalDeleteRecipe(false);
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

    // Al renderizar la vista, realizar la búsqueda de la receta por su ID
    useEffect(() => {
        const loadRecipe = async () => {
            const result = await getRecipeById(id);
            if (result.success) {
                const recipeData = result.data;
                setFormData({
                    title: recipeData.title,
                    preparationTime: recipeData.preparationTime.toString(),
                    servings: recipeData.servingsNumber.toString(),
                    image: recipeData.imageUrl,
                    steps: recipeData.steps,
                    ingredients: recipeData.ingredients,
                    tags: recipeData.tagId,
                    userEmail: recipeData.email,
                });
            } else {
                console.error("Failed to fetch recipe by id: ", result.message);
            }
        };

        loadRecipe();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
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
            return;
        }

        // Verificar la longitud del título
        if (formData.title.length > 27) {
            toast.error("The title must not exceed 27 characters.");
            return;
        }

        console.log(formData);

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
        putApproveRecipeMutation.mutate({ recipeData: recipeData, id: id }, {
            onSuccess: (data) => {
                if (data.success) {
                    navigate("/app/admin-panel");
                } else {
                    toast.error(
                        `An error occurred while submitting the recipe. Please check all the fields and ensure that the ingredients are correct.`
                    );
                }
            },
            onError: (error) => {
                toast.error(
                    `An error occurred while submitting the recipe: ${error.message}`
                );
            },
        });
    };

    // Eliminar la receta
    const handleDeleteRecipe = () => {
        deleteRecipeMutation.mutate(id, {
            onSuccess: () => {
                navigate("/app/admin-panel");
            },
            onError: (error) => {
                toast.error(`Failed to delete recipe: ${error.message}`);
            },
        });
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
                    Review and approve{" "}
                    <span style={{ color: "#00ADB5" }}>recipe</span>
                </h1>
            </div>

            <form onSubmit={handleSubmit}>
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
                                autoCorrect="off"
                                spellCheck="false"
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
                                        {tag.tagName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mt-2 flex flex-col items-center">
                            <input
                                name="image"
                                readOnly
                                type="file"
                                accept=".png, .jpg, .jpeg"
                                ref={fileInputRef}
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
                            <div className="flex items-center pl-9">
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
                                    Ingredients
                                </label>
                                <Tooltip
                                    label={
                                        <>
                                            Enter an ingredient list for what
                                            you are cooking, like "1 cup rice,
                                            10 oz chickpeas", etc.
                                            <br />
                                            Introduce each ingredient on a new
                                            line or separated both by a comma
                                            and a space.
                                        </>
                                    }
                                    placement="right"
                                    hasArrow
                                    bg="#64748b"
                                    color="white"
                                    borderRadius="10px"
                                    p={5}
                                >
                                    <span
                                        style={{
                                            cursor: "help",
                                            marginLeft: "5px",
                                        }}
                                    >
                                        <InfoIcon
                                            size={30}
                                            style={{ color: "#00ADB5" }}
                                        />
                                    </span>
                                </Tooltip>
                            </div>
                            <textarea
                                name="ingredients"
                                autoCorrect="off"
                                spellCheck="false"
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
                                autoCorrect="off"
                                spellCheck="false"
                                value={formData.steps}
                                onChange={handleChange}
                                className="resize-none mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                rows="13"
                            ></textarea>
                        </div>

                        <div className="mt-6 flex grid-cols-2 justify-around items-center">
                            <button
                                type="button"
                                onClick={openDeleteRecipeModal}
                                className="w-2/5 px-4 p-4 bg-red-500 text-white rounded-md hover:bg-red-600 border-2 border-blue-300 text-2xl font-semibold"
                            >
                                Delete Recipe
                            </button>
                            <button
                                type="submit"
                                className="w-2/5 px-4 p-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 border-2 border-blue-300 text-2xl font-semibold"
                                disabled={putApproveRecipeMutation.isPending}
                            >
                                {putApproveRecipeMutation.isPending
                                    ? "Submitting..."
                                    : "Approve Recipe"}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
            <Modal
                    isOpen={modalDeleteRecipe}
                    onRequestClose={closeDeleteRecipeModal}
                    style={customStyles}
                    contentLabel="Delete Recipe Modal"
                >
                    <div className="bg-red-100 p-5">
                        <h2 className="text-center font-bold text-2xl">
                            Warning
                        </h2>
                        <p className="mt-3 font-medium">
                            Are you sure you want to delete this recipe?
                        </p>
                        <div className="flex justify-center gap-24 mt-4">
                            <button
                                onClick={closeDeleteRecipeModal}
                                className="px-4 py-2 text-white rounded font-semibold bg-gray-500 hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteRecipe}
                                className="px-4 py-2 text-white rounded font-semibold bg-red-500 hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </Modal>
        </>
    );
};

export default RecipeBuilder;
