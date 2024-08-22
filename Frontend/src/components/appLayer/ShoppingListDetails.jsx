import React, { useState, useEffect, useCallback } from "react";
import useShoppingList from "../../hooks/mainApp/useShoppingList";
import useRecipe from "../../hooks/mainApp/useRecipe";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";

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
    // Conjunto de líneas de producto en esta lista
    const [products, setProducts] = useState([]); // Conjunto de listas del usuario
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalAddRecipe, setModalAddRecipe] = useState(false);
    const [recipeSearch, setRecipeSearch] = useState("");
    const [total, setTotal] = useState("0.00€");
    const navigate = useNavigate();

    // Hooks
    const {
        getProductLinesById,
        deleteListMutation,
        postProductLineMutation,
        putProductLineMutation,
        deleteProductLineMutation,
        postAddIngredientsFromRecipeMutation
    } = useShoppingList();
    const { getUserRecipesWeeklyPlanner } = useRecipe();

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

    // Calcular el total cada vez que los productos cambien
    useEffect(() => {
        calculateTotal();
    }, [products]);

    // Calculo del total
    const calculateTotal = () => {
        const totalSum = products.reduce((acc, product) => {
            const price = parseFloat(product.price.replace("€", ""));
            const amount = parseInt(product.amount, 10);
            if (amount > 0 && price > 0) {
                return acc + price * amount;
            }
            return acc;
        }, 0);
        setTotal(totalSum.toFixed(2) + "€");
    };

    // Formatear precio
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
        handleUpdateProductLine(productLineID);
    };

    // Al perder el focus del nombre, poner "-" si queda vacío
    const handleNameFormat = (productLineID, value) => {
        const finalValue = value.trim() === "" ? "-" : value;
        updateProduct(productLineID, "productName", finalValue);
        handleUpdateProductLine(productLineID);
    };

    // Comprueba que el cambio es válido
    const handleProductChange = (productLineID, field, value) => {
        if (field === "amount") {
            if (value === "") {
                updateProduct(productLineID, field, 1);
            } else {
                // Convierte el valor a número para eliminar ceros a la izquierda
                let newValue = parseInt(value, 10);
                if (newValue === 0) {
                    newValue = 1;
                }
                if (!isNaN(newValue)) {
                    updateProduct(productLineID, field, newValue);
                } else {
                    updateProduct(productLineID, field, 1); // Si el resultado es NaN, establece el valor a 1
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
                navigate(0);
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

    // Función para abrir el modal Recipe
    const openModalRecipe = () => {
        setModalAddRecipe(true);
    };

    // Función para cerrar el modal Recipe
    const closeModalRecipe = () => {
        setModalAddRecipe(false);
        setRecipeSearch("");
    };

    // Función para agregar un nuevo producto
    const addNewProduct = (id) => {
        postProductLineMutation.mutate(id, {
            onError: (error) => {
                toast.error(
                    `Failed to create new product line: ${error.message}`
                );
            },
        });
    };

    // Función para agregar los ingredientes de una receta
    const handleAddNewRecipeIngredients = (idRecipe, idShoppingList) => {
        postAddIngredientsFromRecipeMutation.mutate({ idRecipe, idShoppingList }, {
            onSuccess: () => {
                // Manejar cualquier lógica adicional en caso de éxito, por ejemplo:
                toast.success("Ingredients added successfully!");
            },
            onError: (error) => {
                // Manejar errores aquí
                toast.error(`Failed to add ingredients: ${error.message}`);
            }
        });
        closeModalRecipe();
    };

    // Función para actualizar los valores de una línea ya existente
    const handleUpdateProductLine = (productLineID) => {
        const productToUpdate = products.find(
            (p) => p.productLineID === productLineID
        );
        if (productToUpdate) {
            const productName =
                productToUpdate.productName.trim() === ""
                    ? "-"
                    : productToUpdate.productName; // Necesario para que no de error el back al mandar una cadena vacia
            putProductLineMutation.mutate({
                productLineID: productLineID,
                updatedProduct: {
                    ProductName: productName,
                    Amount: productToUpdate.amount,
                    Price: parseFloat(
                        productToUpdate.price.replace("€", "").trim()
                    ),
                },
            });
        }
    };

    // Función para eliminar una línea
    const handleDeleteProductLine = (productLineID) => {
        deleteProductLineMutation.mutate(productLineID, {
            onSuccess: () => {
                setProducts(
                    products.filter(
                        (product) => product.productLineID !== productLineID
                    )
                );
            },
            onError: (error) => {
                toast.error(`Failed to delete product line: ${error.message}`);
            },
        });
    };

    // Buscador de recetas para añadir sus ingredientes
    const fetchUserRecipes = useCallback(() => {
        return getUserRecipesWeeklyPlanner(userData?.email, recipeSearch);
    }, [userData?.email, recipeSearch]);

    // Recetas del usuario filtradas por nombre
    const { data: foundRecipes, refetch } = useQuery({
        queryKey: [],
        queryFn: fetchUserRecipes,
        keepPreviousData: true,
        enabled: !!userData?.email,
    });

    // Función para cambiar valor de la barra de búsqueda
    const handleChange = (event) => {
        setRecipeSearch(event.target.value);
    };

    // Realizar búsqueda por nombre al pulsar el intro
    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            refetch();
        }
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
                className="grid grid-cols-6 text-3xl font-semibold mt-4 mb-1 place-items-center text-white border-b-4 border-white pb-2"
                style={{ letterSpacing: "0.5px" }}
            >
                <label className="col-span-3">Product</label>
                <label>Amount</label>
                <label>Price/Unit</label>
            </div>
            <div className="overflow-y-auto h-[60vh]">
                {products.map((product, index) => (
                    <div
                        key={product.productLineID}
                        className={`grid grid-cols-6 text-xl text-white mb-1 place-items-center ${
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
                            onBlur={(e) =>
                                handleNameFormat(
                                    product.productLineID,
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
                            onBlur={() =>
                                handleUpdateProductLine(product.productLineID)
                            }
                        />
                        <input
                            type="text"
                            value={
                                product.price === "0.00€" ? "-" : product.price
                            }
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
                        <button
                            onClick={() =>
                                handleDeleteProductLine(product.productLineID)
                            }
                            className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-2 rounded-full text-sm mb-1"
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center px-14 mb-5">
                <span className="text-white text-4xl font-semibold whitespace-nowrap">
                    Total: {total}
                </span>

                <button
                    onClick={() => addNewProduct(list.shoppingListID)}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded text-2xl"
                >
                    New Product
                </button>

                <button
                    onClick={openModalRecipe}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded text-2xl"
                >
                    Add Recipe
                </button>

                <button
                    onClick={openModal}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded text-2xl"
                >
                    Delete List
                </button>
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

            <Modal
                isOpen={modalAddRecipe}
                onRequestClose={closeModalRecipe}
                style={customStyles}
                contentLabel="Confirm Delete"
            >
                <div className="flex flex-col items-center justify-center p-5 bg-slate-100">
                    <h2 className="mb-4 text-xl text-center font-semibold">
                        Add the ingredientes from one recipe
                    </h2>
                    <input
                        type="text"
                        value={recipeSearch}
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck="false"
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Your Recipes..."
                        className="mb-4 p-2 w-full text-center font-semibold placeholder:text-gray-600 bg-slate-300 rounded-xl"
                    />
                    <div
                        className="overflow-y-auto"
                        style={{
                            minHeight: "120px",
                            maxHeight: "200px",
                        }}
                    >
                        {Array.isArray(foundRecipes) &&
                            foundRecipes.map((event) => (
                                <div
                                    key={event.id}
                                    className="p-2 rounded my-2 bg-sky-600 text-white font-semibold"
                                >
                                    <div>{event.title}</div>
                                    <div className="flex justify-center gap-2">
                                        <Link
                                            to={`/app/recipe/${event.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center mt-2 mb-1 px-2 py-1 text-sm font-medium text-center text-white rounded-xl bg-slate-400 hover:bg-slate-500 active:bg-slate-600"
                                            
                                        >
                                            See Recipe
                                        </Link>
                                        <button                                      
                                            className="inline-flex items-center mt-2 mb-1 px-2 py-1 text-sm font-medium text-center text-white rounded-xl bg-slate-400 hover:bg-slate-500 active:bg-slate-600"
                                            onClick={() => handleAddNewRecipeIngredients(event.id, list.shoppingListID)}
                                        >
                                            Add to List
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ShoppingListDetails;
