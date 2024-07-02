import React, { useState, useEffect } from "react";
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

const ShoppingListDetails = ({ list }) => {
    // Conjunto de líneas de producto en esta lista
    const [products, setProducts] = useState([]); // Conjunto de listas del usuario
    const [modalIsOpen, setModalIsOpen] = useState(false);

    // Hooks
    const { getProductLinesById, deleteListMutation } = useShoppingList();

    // Al renderizar el componente, llamar al método de obtención de líneas de producto
    const { data: listProductLines, isLoading: loadProductLines } = useQuery({
        queryKey: ["product-lines", list.shoppingListID],
        queryFn: () => getProductLinesById(list.shoppingListID),
        options: {
            keepPreviousData: true,
            enabled: !!list.shoppingListID,
        },
    });

    // Guardar las líneas de producto obtenidas provenientes de la base de datos con el formato correcto
    useEffect(() => {
        if (listProductLines && listProductLines.success) {
            const formattedProducts = listProductLines.data.map((product) => ({
                ...product,
                price: formatPrice(product.price), // Formatear el precio aquí
            }));
            setProducts(formattedProducts);
        } else {
            setProducts([]);
        }
    }, [listProductLines]);

    //
    const formatPrice = (price) => {
        let formattedPrice = price.toString().replace(",", ".");
        const numericValue = parseFloat(formattedPrice);
        formattedPrice = isNaN(numericValue) ? "0.00" : numericValue.toFixed(2);
        return formattedPrice + "€";
    };

    // Al perder el focus del precio, formatear valor para eliminar ceros a la izquierda
    const handlePriceFormat = (productLineID, value) => {
        // Remover los caracteres no deseados y garantizar dos decimales
        let formattedValue = value.replace(/[^0-9.]/g, "").replace(/^0+/, "");
        if (formattedValue.startsWith(".")) {
            formattedValue = "0" + formattedValue; // Asegurar un cero antes del punto si es necesario
        }
        // Convertir a número flotante y luego a string para fijar dos decimales
        const numericValue = parseFloat(formattedValue);
        formattedValue = isNaN(numericValue) ? "0.00" : numericValue.toFixed(2); // Usar "0.00" si no es un número
        updateProduct(productLineID, "price", formattedValue + "€");
    };

    // Comprueba que el cambio es válido
    const handleProductChange = (productLineID, field, value) => {
        if (field === "amount") {
            if (value === "") {
                updateProduct(productLineID, field, 0);
            } else {
                // Convierte el valor a número para eliminar ceros a la izquierda
                const newValue = parseInt(value, 10);
                if (!isNaN(newValue)) {
                    updateProduct(productLineID, field, newValue);
                } else {
                    updateProduct(productLineID, field, 0); // Si el resultado es NaN, establece el valor a 0
                }
            }
        } else if (field === "price") {
            // Eliminar todo lo que no sea números o el punto
            let formattedValue = value.replace(/[^0-9.]/g, "");
            // Limitar a un solo punto para los decimales
            const match = formattedValue.match(/\d*\.?\d{0,2}/);
            formattedValue = match ? match[0] : "";
            updateProduct(productLineID, field, formattedValue);
        } else {
            updateProduct(productLineID, field, value);
        }
    };

    // Si el parámetro a cambiar es válido, se procede al cambio
    const updateProduct = (productLineID, field, value) => {
        setProducts((currentProducts) =>
            currentProducts.map((product) =>
                product.productLineID === productLineID
                    ? { ...product, [field]: value }
                    : product
            )
        );
    };

    // Eliminar una lista
    const handleDeleteList = (id) => {
        deleteListMutation.mutate(id, {
            onSuccess: () => {
                toast.success("Deleted list!");
            },
            onError: (error) => {
                toast.error(`Failed to delete list: ${error.message}`);
            },
        });
    };

    // Función para abrir el modal
    const openModal = () => {
        setModalIsOpen(true);
    };

    // Función para cerrar el modal
    const closeModal = () => {
        setModalIsOpen(false);
    };

    // Mensaje de cargando datos de listas
    if (loadProductLines) {
        return (
            <div className="flex justify-center mt-6">
                <h1 className="text-3xl text-stone-300">
                    Loading product lines...{" "}
                </h1>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full justify-between">
            <h1
                className="text-5xl font-semibold text-center text-white"
                style={{ letterSpacing: "2px" }}
            >
                {list.shoppingListName}
            </h1>
            <div
                className="grid grid-cols-5 text-3xl font-semibold mt-4 mb-1 place-items-center text-white border-b-4 border-white pb-2"
                style={{ letterSpacing: "0.5px" }}
            >
                <label className="col-span-3">Product</label>
                <label>Amount</label>
                <label>Price/Unit</label>
            </div>
            <div className="overflow-y-auto h-[60vh] mb-4">
                {products.map((product, index) => (
                    <div
                        key={product.productLineID}
                        className={`grid grid-cols-5 text-xl text-white mb-1 place-items-center ${
                            index !== products.length - 1
                                ? "border-b border-white"
                                : ""
                        }`}
                    >
                        <input
                            type="text"
                            value={product.productName}
                            className="bg-transparent text-center border-none text-white col-span-3 w-full outline-none"
                            onChange={(e) =>
                                handleProductChange(
                                    product.productLineID,
                                    "productName",
                                    e.target.value
                                )
                            }
                        />
                        <input
                            type="text"
                            value={product.amount.toString()}
                            className="bg-transparent text-center border-none text-white outline-none ml-4"
                            onChange={(e) =>
                                handleProductChange(
                                    product.productLineID,
                                    "amount",
                                    e.target.value
                                )
                            }
                        />
                        <input
                            type="text"
                            value={product.price}
                            className="bg-transparent text-center border-none text-white outline-none ml-4"
                            onChange={(e) =>
                                handleProductChange(
                                    product.productLineID,
                                    "price",
                                    e.target.value
                                )
                            }
                            onBlur={(e) =>
                                handlePriceFormat(
                                    product.productLineID,
                                    e.target.value
                                )
                            }
                        />
                    </div>
                ))}
            </div>
            <div>
                <div className="flex items-center mb-5 justify-between px-14">
                    <span className="font-semibold text-white text-4xl">
                        Total: 00.00€
                    </span>

                    <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded text-2xl">
                        Save List
                    </button>

                    <button
                        onClick={openModal}
                        className="mr-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded text-2xl"
                    >
                        Delete List
                    </button>
                </div>
            </div>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                style={customStyles}
                contentLabel="Confirm Delete"
            >
                <div className="flex flex-col items-center justify-center p-5">
                    <h2 className="mb-4 text-xl text-center font-semibold">
                        Are you sure you want to delete this list?
                    </h2>
                    <div className="flex gap-10">
                        <button
                            onClick={closeModal}
                            className="font-semibold bg-red-500 hover:bg-red-600 p-2 rounded-xl text-white"
                        >
                            Close
                        </button>
                        <button
                            onClick={() =>
                                handleDeleteList(list.shoppingListID)
                            }
                            className="font-semibold bg-blue-500 hover:bg-blue-600 py-2 px-3 rounded-xl text-white"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ShoppingListDetails;
