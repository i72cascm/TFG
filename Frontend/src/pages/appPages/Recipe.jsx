import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import useRecipe from "../../hooks/mainApp/useRecipe";
import useLike from "../../hooks/mainApp/useLike";
import fondoPizarra from "/fondoPizarra.png";
import fondoPizarraMirror from "/fondoPizarraMirror.png";
import Modal from "react-modal";
import { useQuery } from "@tanstack/react-query";
import {
    CircleUserRound,
    Clock,
    Users,
    Tag,
    Heart,
    Fullscreen,
} from "lucide-react";

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
    },
    overlay: {
        backgroundColor: "rgba(0, 0, 0, 0.75)",
    },
};

const Recipe = () => {

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

    const { id } = useParams();
    const [recipe, setRecipe] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);

    // Hooks
    const { getRecipeById } = useRecipe();
    const { getTotalLikes, getLikeStatus ,postLikeMutation, deleteLikeMutation } = useLike();

    // Al renderizar el componente, llamar al método de obtención de like status
    const { data: likeStatus, isLoading: loadLike } = useQuery({
        queryKey: ["recipe-likes", id],
        queryFn: () => getLikeStatus({userName: userData.name, recipeId: recipe.id}),
        options: {
            keepPreviousData: true
        },
    });

    const { data: totalLikes, isLoading: loadTotalLike } = useQuery({
        queryKey: ["recipe-likes", recipe?.id],
        queryFn: () => getTotalLikes(recipe?.id),
        enabled: !!recipe, // Solo ejecutar la consulta cuando recipe está disponible
    });

    // Al renderizar la vista, realizar la búsqueda de la receta por su ID
    useEffect(() => {
        const loadRecipe = async () => {
            const result = await getRecipeById(id);
            if (result.success) {
                setRecipe(result.data);
            } else {
                console.error("Failed to fetch recipe by id: ", result.message);
            }
        };

        loadRecipe();
    }, [id]);

    // Alternar entre dar like y quitarlo
    const handleIsLiked = () => {
        if (likeStatus === false){
            postLikeMutation.mutate({
                userName: userData.name, recipeId: recipe.id 
            }, {
                onError: (error) => {
                    toast.error(
                        `Failed to give like: ${error.message}`
                    );
                },
            });
        } else {
            deleteLikeMutation.mutate({
                userName: userData.name, recipeId: recipe.id 
            }, {
                onError: (error) => {
                    toast.error(
                        `Failed to remove like: ${error.message}`
                    );
                },
            });
        }
    }

    if (!recipe || loadLike || loadTotalLike) {
        return (
            <div className="flex justify-center mt-6">
                <h1 className="text-3xl text-stone-300">Loading recipe... </h1>
            </div>
        );
    }

    return (
        <>
            <div className="flex justify-center mt-2 mb-7">
                <h1 className="text-sky-600 font-black text-7xl col-span-2 capitalize">
                    {recipe.title}
                </h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-4 mx-4">
                <div
                    className="mb-4 p-4 rounded-xl border-slate-700 bg-slate-700"
                    style={{
                        backgroundImage: `url(${fondoPizarra})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                    <div className="mt-6 grid grid-cols-2">
                        <div className="flex justify-center items-center relative group">
                            <img
                                src={recipe.recipeImage}
                                alt="Recipe Image"
                                className="rounded-lg transition duration-300 ease-in-out group-hover:brightness-50"
                                style={{
                                    width: "300px",
                                    height: "300px",
                                    objectFit: "cover",
                                }}
                            />
                            <div
                                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out"
                                onClick={() => setModalIsOpen(true)}
                            >
                                <Fullscreen size={40} className="text-white" />
                            </div>
                        </div>
                        <div
                            className="flex items-center text-white p-4 rounded-lg"
                            style={{
                                height: "300px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                            }}
                        >
                            <div
                                className="grid grid-cols-2 gap-4 items-center text-center"
                                style={{ width: "100%" }}
                            >
                                <div className="flex flex-col items-center">
                                    <Clock size={25} className="mb-3" />
                                    <p className="font-semibold text-xl mb-3">
                                        {recipe.preparationTime} minutes
                                    </p>
                                </div>
                                <div className="font-semibold flex flex-col items-center">
                                    <Users size={25} className="mb-3" />
                                    <p className="text-xl mb-3">
                                        {recipe.servingsNumber} servings
                                    </p>
                                </div>
                                <div className="font-semibold flex flex-col items-center">
                                    <Tag size={25} className="mb-3" />
                                    <p className="text-xl mb-3">
                                        {recipe.tagName}
                                    </p>
                                </div>
                                <div className="font-semibold flex flex-col items-center">
                                    <button onClick={handleIsLiked}>
                                        {likeStatus ? (<Heart size={25} color="red" fill="red"  className="mb-3" />) : (<Heart size={25} className="mb-3" />)}
                                    </button>
                                    <p className="text-xl mb-3">{totalLikes} Likes</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-center mt-4">
                                <CircleUserRound size={25} className="mb-3" />
                                <p className="font-semibold text-xl mb-3">
                                    {recipe.userName}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    className="bg-slate-700 mb-4 p-4 rounded-xl border-slate-700"
                    style={{
                        backgroundImage: `url(${fondoPizarraMirror})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                    <div className="mt-2 flex flex-col items-center">
                        <label className="font-semibold text-3xl capitalize text-white mb-3">
                            Ingredients
                        </label>
                        <textarea
                            name="ingredients"
                            value={recipe.ingredients}
                            readOnly
                            className="resize-none mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md"
                            rows="5"
                        ></textarea>
                    </div>
                    <div className="mt-6 flex flex-col items-center">
                        <label className="font-semibold text-3xl capitalize text-white my-3">
                            Steps
                        </label>
                        <textarea
                            name="steps"
                            value={recipe.steps}
                            readOnly
                            className="resize-none mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md"
                            rows="13"
                        ></textarea>
                    </div>
                </div>
            </div>

            {/* Modal para ampliar la imagen de la receta */}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                style={customStyles}
                contentLabel="Recipe Image Modal"
            >
                <div className="relative">
                    <img
                        src={recipe.recipeImage}
                        alt="Recipe Image"
                        className="rounded-lg"
                        style={{
                            width: "100%",
                            height: "auto",
                            objectFit: "contain",
                        }}
                    />
                </div>
            </Modal>
        </>
    );
};

export default Recipe;
