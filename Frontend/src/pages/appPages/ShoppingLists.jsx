import { useState, useEffect } from "react";
import ShoppingListRow from "../../components/appLayer/ShoppingListRow";
import useShoppingList from "../../hooks/mainApp/useShoppingList";
import { useQuery } from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import Modal from "react-modal";

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

const ShoppingLists = () => {
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

    // Estados
    const [activeIndex, setActiveIndex] = useState(null); // Índice de la lista
    const [shoppingLists, setShoppingLists] = useState([]); // Conjunto de listas del usuario
    const [modalIsOpenNewList, setModalIsOpenNewList] = useState(false); // Estado para controlar la visibilidad del modal
    const [newListName, setNewListName] = useState(""); // Estado para el nombre de la nueva lista

    // Hooks usados
    const { getShoppingListsByUser, postNewListMutation } = useShoppingList();

    // Al renderizar la página, llamar al método de obtención de listas de compra del usuario
    const { data: userShoppingLists, isLoading: loadShoppingLists } = useQuery({
        queryKey: ["user-shopping-lists"],
        queryFn: () => getShoppingListsByUser(userData?.email),
        keepPreviousData: true,
        enabled: !!userData?.email,
    });

    useEffect(() => {
        if (userShoppingLists && userShoppingLists.success) {
            setShoppingLists(userShoppingLists.data); // Actualizar el estado con los datos obtenidos
        } else {
            setShoppingLists([]); // Se establece como vacío si no hay datos
        }
    }, [userShoppingLists]);

    // Actualizar el índice activo
    const handleRowClick = (index) => {
        setActiveIndex(index);
    };

    const openModalNewList = () => {
        setModalIsOpenNewList(true);
    };

    const closeModalNewList = () => {
        setModalIsOpenNewList(false);
        setNewListName("");
    };

    const handleNewList = () => {
        console.log("flag");

        // Controlar que el nombre no tenga más de 20 caracteres
        if (newListName.length > 20) {
            toast.error("List name must be 20 characters or less");
            return;
        }

        postNewListMutation.mutate(
            { email: userData.email, listName: newListName },
            {
                onSuccess: () => {
                    toast.success("Created new list!");
                },
                onError: (error) => {
                    toast.error(`Failed to create new list:: ${error.message}`);
                },
            }
        );

        closeModalNewList();
    };

    // Mensaje de cargando datos de listas
    if (loadShoppingLists) {
        return (
            <div className="flex justify-center mt-6">
                <h1 className="text-3xl text-stone-300">
                    Loading shopping lists...{" "}
                </h1>
            </div>
        );
    }

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
                    your{" "}
                    <span style={{ color: "#00ADB5" }}>shopping lists</span>
                </h1>
            </div>
            <div className="grid grid-cols-[4fr,1fr] h-[85vh] gap-4 mx-4">
                <div className="mb-4 p-4 rounded-xl border-slate-700 bg-slate-700">
                    {activeIndex !== null ? (
                        <div className="text-white text-xl">
                            <p>Active List:</p>
                            <h2 className="text-3xl font-bold">
                                Shopping List #{activeIndex + 1}
                            </h2>
                        </div>
                    ) : (
                        <p className="text-white text-xl">
                            Select a list to view its details.
                        </p>
                    )}
                </div>
                <div>
                    <div className="flex flex-col overflow-y-auto h-[70vh] gap-2 mb-4 p-4 rounded-xl border-slate-700 bg-slate-700">
                        {shoppingLists.map((list, index) => (
                            <ShoppingListRow
                                key={list.shoppingListID}
                                list={list}
                                index={index}
                                isActive={index === activeIndex}
                                onClick={() => handleRowClick(index)} // Aquí pasa el índice
                            />
                        ))}
                    </div>
                    <div>
                        <Modal
                            isOpen={modalIsOpenNewList}
                            onRequestClose={closeModalNewList}
                            style={customStyles}
                            contentLabel="New Shopping List"
                        >
                            <div className="flex flex-col items-center justify-center p-5">
                                <input
                                    type="text"
                                    value={newListName}
                                    onChange={(e) =>
                                        setNewListName(e.target.value)
                                    }
                                    className="mb-4 p-2 w-full text-center font-semibold"
                                    placeholder="Enter list name"
                                />
                                <div className="flex gap-10">
                                    <button
                                        onClick={closeModalNewList}
                                        className="btn btn-secondary font-semibold bg-red-500 hover:bg-red-600 p-2 rounded-xl"
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={handleNewList}
                                        className="btn btn-primary font-semibold bg-blue-500 hover:bg-blue-600 py-2 px-3 rounded-xl"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </Modal>
                        <button
                            onClick={openModalNewList}
                            className="w-full xl:h-[10vh] sm:h-[20vh] rounded-xl p-5 border-4 font-bold text-3xl bg-white/70 hover:bg-gray-100 active:bg-gray-400 transition duration-200 ease-in-out"
                            style={{ borderColor: "#222831" }}
                        >
                            New List
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ShoppingLists;
