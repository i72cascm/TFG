import { useState, useEffect } from "react";
import useUserSettings from "../../hooks/mainApp/useUserSettings";
import { useQuery } from "@tanstack/react-query";
import Modal from "react-modal";
import Pagination from "./Pagination";

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

const AdminUsers = () => {
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
    const [selectedUser, setSelectedUser] = useState("");
    const [modalDeleteAccount, setModalDeleteAccount] = useState(false);
    const [page, setPage] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [inputValue, setInputValue] = useState("");
    const [search, setSearch] = useState("");

    // Funciones para abrir y cerrar los modales
    const openDeleteAccountModal = (userEmail) => {
        setSelectedUser(userEmail);
        setModalDeleteAccount(true);
    };
    const closeDeleteAccountModal = () => {
        setSelectedUser("");
        setModalDeleteAccount(false);
    };

    // Funciones del hook de Users
    const { getPagedUsers, deleteUserMutation } = useUserSettings();

    // Query para obtener usuarios
    const {
        data: paginatedUsers,
        isLoading: loadingPaginatedUsers,
        isPlaceholderData
    } = useQuery({
        queryKey: ["user-admin", page, search],
        queryFn: () => getPagedUsers(page, 15, search),
        keepPreviousData: true,
    });

    // Cada vez que la query sea actualizada, almacenar sus parámetros
    useEffect(() => {
        if (paginatedUsers && !(paginatedUsers instanceof Error)) {
            setCurrentPage(paginatedUsers.data.pageInfo.currentPage);
            setTotalPages(paginatedUsers.data.pageInfo.totalPages);
        } else if (paginatedUsers instanceof Error) {
            console.error("Error updating pages");
        }
    }, [paginatedUsers]);

    // Realizar búsqueda por email al pulsar el intro
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

    // Eliminar al usuario
    const handleDeleteAccount = () => {
        deleteUserMutation.mutate(selectedUser, {
            onSuccess: () => {
                setPage(1);
            },
            onError: (error) => {
                toast.error(
                    `An error occurred while deleting user: ${error.message}`
                );
            },
        });
        closeDeleteAccountModal();
    };

    // Mensaje de cargando datos de usuario
    if (loadingPaginatedUsers) {
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
                isOpen={modalDeleteAccount}
                onRequestClose={closeDeleteAccountModal}
                style={customStyles}
                contentLabel="Delete Account Modal"
            >
                <div className="bg-red-100 p-5">
                    <h2 className="text-center font-bold text-2xl">Warning</h2>
                    <p className="mt-3 font-medium">
                        Are you sure you want to delete this account? This
                        action cannot be undone.
                    </p>
                    <div className="flex justify-center gap-24 mt-4">
                        <button
                            onClick={closeDeleteAccountModal}
                            className="px-4 py-2 text-white rounded font-semibold bg-gray-500 hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteAccount}
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
                    placeholder="Search users by email..."
                    className="mb-4 px-4 py-1 bg-slate-500 w-3/6 rounded-xl border-2 border-gray-300 text-2xl text-white placeholder:text-gray-300"
                />
            </div>
            <ul className="px-4">
                <li className="text-white flex items-center justify-between border-b border-gray-300 py-2 text-center">
                    <span className="flex-1 font-semibold">Email</span>
                    <span className="flex-1 font-semibold">Username</span>
                    <span className="flex-1 font-semibold">Role</span>
                    <span className="flex-1 font-semibold"></span>
                </li>
                {paginatedUsers?.data?.users &&
                    paginatedUsers.data.users.map((user) => (
                        <li
                            key={user.id}
                            className="text-white flex items-center justify-between border-b border-gray-300 py-2 text-center"
                        >
                            <span className="flex-1">{user.email}</span>
                            <span className="flex-1">{user.userName}</span>
                            <span className="flex-1">{user.role}</span>
                            <div className="flex-1">
                                {user.userName === userData.name ? (
                                    <button
                                        className="bg-gray-500 text-white py-1 px-3 rounded mr-2 font-semibold"
                                        disabled
                                    >
                                        Delete
                                    </button>
                                ) : (
                                    <button
                                        className="bg-red-500 text-white py-1 px-3 rounded mr-2 hover:bg-red-600 font-semibold"
                                        onClick={() =>
                                            openDeleteAccountModal(user.email)
                                        }
                                    >
                                        Delete
                                    </button>
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

export default AdminUsers;
