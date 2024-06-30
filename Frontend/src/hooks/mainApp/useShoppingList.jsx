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

    const getShoppingListsByUser = async (email) => {
        try {
            console.log(email)
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

    return { getShoppingListsByUser, postNewListMutation };
}

export default useShoppingList