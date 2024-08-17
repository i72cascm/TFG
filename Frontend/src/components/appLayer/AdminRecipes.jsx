import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Modal from "react-modal";
import Pagination from "./Pagination";
import { useNavigate } from "react-router-dom";
import { urlApi } from "../../constants/endpoint";
import useRecipe from "../../hooks/mainApp/useRecipe";
import { Link } from "react-router-dom";

// Estilos del modal
const customStyles = {
    content: {
        top: "50%",
        left: "50%",
        right: "auto",
        bottom: "auto",
        marginRight: "-50%",
        transform: "translate(-50%, -50%)",
        padding: "0%",
    },
    overlay: {
        backgroundColor: "rgba(0, 0, 0, 0.60)",
    },
};

Modal.setAppElement("#root");

const AdminRecipes = () => {
    // Estados
    const [selectedRecipe, setSelectedRecipe] = useState("");
    const [modalDeleteRecipe, setModalDeleteRecipe] = useState(false);
    const [page, setPage] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [inputValue, setInputValue] = useState("");
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    // Funciones para abrir y cerrar los modales
    const openDeleteRecipeModal = (recipeId) => {
        setSelectedRecipe(recipeId);
        setModalDeleteRecipe(true);
    };
    const closeDeleteRecipeModal = () => {
        setSelectedRecipe("");
        setModalDeleteRecipe(false);
    };

    // Hook
    const { getPagedRecipesAdmin, deleteRecipeMutation } = useRecipe();

    // Query para obtener las recetas
    const {
        data: paginatedRecipes,
        isLoading: loadingPaginatedRecipes,
        isPlaceholderData,
    } = useQuery({
        queryKey: ["user-recipes", "recipes", page, search],
        queryFn: () => getPagedRecipesAdmin(page, 15, search),
        keepPreviousData: true,
    });

    // Cada vez que la query sea actualizada, almacenar sus parámetros
    useEffect(() => {
        if (paginatedRecipes && !(paginatedRecipes instanceof Error)) {
            setCurrentPage(paginatedRecipes.data.pageInfo.currentPage);
            setTotalPages(paginatedRecipes.data.pageInfo.totalPages);
        } else if (paginatedRecipes instanceof Error) {
            console.error("Error updating pages");
        }
    }, [paginatedRecipes]);

    // Realizar la búsqueda por email al pulsar el intro
    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            setPage(1);
            setSearch(inputValue);
        }
    };

    // Función para cambiar valor de la barra de búsqueda
    const handleChange = (event) => {
        setInputValue(event.target.value);
    };

    // Eliminar la receta
    const handleDeleteRecipe = () => {
        deleteRecipeMutation.mutate(selectedRecipe, {
            onSuccess: () => {
                setPage(1);
            },
            onError: (error) => {
                toast.error(
                    `An error occurred while deleting recipe: ${error.message}`
                );
            },
        });
        closeDeleteRecipeModal();
    };

    // Mensaje de cargando datos de usuario
    if (loadingPaginatedRecipes) {
        return (
            <div className="flex justify-center mt-6">
                <h1 className="text-3xl text-stone-300">
                    Loading user settings...{" "}
                </h1>
            </div>
        );
    }

    return (
        <>
            <Modal
                isOpen={modalDeleteRecipe}
                onRequestClose={closeDeleteRecipeModal}
                style={customStyles}
                contentLabel="Delete Recipe Modal"
            >
                <div className="bg-red-100 p-5">
                    <h2 className="text-center font-bold text-2xl">Warning</h2>
                    <p className="mt-3 font-medium">
                        Are you sure you want to delete this recipe? This action
                        cannot be undone.
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
            <div className="flex justify-center">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Search recipes by title or author..."
                    className="mb-4 px-4 py-1 bg-slate-500 w-3/6 rounded-xl border-2 border-gray-300 text-2xl text-white placeholder:text-gray-300"
                />
            </div>
            <ul className="px-4">
                <li className="text-white flex items-center justify-between border-b border-gray-300 py-2 text-center">
                    <span className="flex-1 font-semibold">Name</span>
                    <span className="flex-1 font-semibold">Username</span>
                    <span className="flex-1 font-semibold">Email</span>
                    <span className="flex-1 font-semibold">Publish</span>
                    <span className="flex-1 font-semibold">Tag</span>
                    <span className="flex-1 font-semibold"></span>
                </li>
                {paginatedRecipes?.data?.recipes &&
                    paginatedRecipes.data.recipes.map((recipe) => (
                        <li
                            key={recipe.id}
                            className="text-white flex items-center justify-between border-b border-gray-300 py-2 text-center"
                        >
                            <span className="flex-1 overflow-hidden whitespace-nowrap truncate">
                                {recipe.title}
                            </span>
                            <span className="flex-1 overflow-hidden whitespace-nowrap truncate">
                                {recipe.userName}
                            </span>
                            <span className="flex-1 overflow-hidden whitespace-nowrap truncate">
                                {recipe.email}
                            </span>
                            {recipe.isPublish ? (
                                <span className="flex-1">Yes</span>
                            ) : (
                                <span className="flex-1">No</span>
                            )}
                            <span className="flex-1 overflow-hidden whitespace-nowrap truncate">
                                {recipe.tagName}
                            </span>
                            <div className="flex-1">
                                {recipe.pending ? (
                                    <button className="bg-green-500 text-white py-1 px-5 rounded mr-2 hover:bg-green-600 font-semibold">
                                        <Link
                                            to={`/app/admin-approval/${recipe.id}`}
                                            
                                        >
                                            Pending Approval...
                                        </Link>
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            className="bg-blue-500 text-white py-1 px-3 rounded mr-2 hover:bg-blue-600 font-semibold"
                                            onClick={() =>
                                                navigate(
                                                    `/app/recipe/${recipe.id}`
                                                )
                                            }
                                        >
                                            See Recipe
                                        </button>
                                        <button
                                            className="bg-red-500 text-white py-1 px-3 rounded mr-2 hover:bg-red-600 font-semibold"
                                            onClick={() =>
                                                openDeleteRecipeModal(recipe.id)
                                            }
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </li>
                    ))}
                {totalPages > 1 ? (
                    <Pagination
                        page={currentPage}
                        totalPages={totalPages}
                        setPage={setPage}
                        isPlaceholderData={isPlaceholderData}
                    />
                ) : (
                    ""
                )}
            </ul>
        </>
    );
};

export default AdminRecipes;
