import { urlApi } from "../../constants/endpoint";
import { useMutation, useQueryClient } from '@tanstack/react-query';

const useShoppingList = () => {
    const queryClient = useQueryClient();

    const getAuthState = () => {
        // Obtener el valor de la cookie por su nombre
        const token = document.cookie
            .split("; ")
            .find((row) => row.startsWith("_auth="))
            ?.split("=")[1];

        if (!token) {
            return null;
        }
        return token;
    };
    const userToken = getAuthState();
    
    ///////////////////////////////////////////////////////////////////////////////
    /////////////////////////// SHOPPING LISTS ////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////
    
    const getShoppingListsByUser = async (email) => {
        try {
            const response = await fetch(`${urlApi}/api/shoppinglist/${email}`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": userToken
                },
            });
    
            if (response.status === 200) {
                const data = await response.json();
                return { success: true, data };
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error getting shopping lists");
            }
        } catch (error) {
            console.error("Error getting shopping lists:", error);
            throw new Error(error.message);
        }
    }

    const postNewList = async (email, listName) => {
        try {
            const response = await fetch(`${urlApi}/api/shoppinglist/${email}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": userToken
                },
                body: JSON.stringify({ NameList: listName }),
            });
    
            if (response.status === 200) {
                return { success: true };
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error adding new shopping list");
            }
        } catch (error) {
            console.error("Error adding new shopping list:", error);
            throw new Error(error.message);
        }
    };

    const postNewListMutation = useMutation({
        mutationFn: ({ email, listName }) => postNewList(email, listName),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['user-shopping-lists']
            });
        }
    })

    const deleteList = async (id) => {
        try {
            const response = await fetch(`${urlApi}/api/shoppinglist/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": userToken
                }
            });
    
            if (response.status === 200) {
                return { success: true };
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error deleting shopping list");
            }
        } catch (error) {
            console.error("Error deleting shopping list:", error);
            throw new Error(error.message);
        }
    };
    

    const deleteListMutation = useMutation({
        mutationFn: deleteList,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['user-shopping-lists']
            });
        }
    })

    ///////////////////////////////////////////////////////////////////////////////
    /////////////////////////// PRODUCT LINES /////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////

    const getProductLinesById = async (id) => {
        try {
            const response = await fetch(`${urlApi}/api/shoppinglist/productLines/${id}`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": userToken
                },
            });
    
            if (response.status === 200) {
                const data = await response.json();
                return { success: true, data };
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error getting product lines");
            }
        } catch (error) {
            console.error("Error getting product lines:", error);
            throw new Error(error.message);
        }
    }

    const postProductLine = async (id) => {
        try {
            const response = await fetch(`${urlApi}/api/shoppinglist/productLines/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": userToken
                },
                body: JSON.stringify({ ProductName: "-", Amount: 0, Price: 0 })
            });
    
            if (response.status === 200) {
                return { success: true };
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error adding new product line");
            }
        } catch (error) {
            console.error("Error adding new product line:", error);
            throw new Error(error.message);
        }
    };

    const postProductLineMutation = useMutation({
        mutationFn: postProductLine,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['product-lines']
            });
        }
    })

    const putProductLine = async (data) => {
        try {
            const productLineID = data.productLineID;
            const productData = data.updatedProduct
            const response = await fetch(`${urlApi}/api/shoppinglist/productLines/${productLineID}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": userToken
                },
                body: JSON.stringify(productData)
            });
    
            if (response.status === 200) {
                return { success: true };
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error updating product line");
            }
        } catch (error) {
            console.error("Error updating product line:", error);
            throw new Error(error.message);
        }
    };

    const putProductLineMutation = useMutation({
        mutationFn: putProductLine,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['product-lines']
            });
        }
    })

    const deleteProductLine  = async (id) => {
        try {
            const response = await fetch(`${urlApi}/api/shoppinglist/productLines/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": userToken
                }
            });
    
            if (response.status === 200) {
                return { success: true };
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error deleting product line");
            }
        } catch (error) {
            console.error("Error deleting product line:", error);
            throw new Error(error.message);
        }
    };

    const deleteProductLineMutation = useMutation({
        mutationFn: deleteProductLine ,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['product-lines']
            });
        }
    })


    return { getShoppingListsByUser, getProductLinesById, postNewListMutation, deleteListMutation, postProductLineMutation, putProductLineMutation, deleteProductLineMutation };
}

export default useShoppingList