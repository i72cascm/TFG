import { urlApi } from "../../constants/endpoint";
import { useMutation, useQueryClient } from '@tanstack/react-query';

const useRecipeTag = () => {
	
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

    const getAllRecipeTags = async () => {
        try {
            const response = await fetch(`${urlApi}/api/recipetag`, {
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
                throw new Error(errorData.message || "Error getting all recipe tags");
            }
        } catch (error) {
            console.error("Error getting all recipe tags:", error);
            throw new Error(error.message);
        }
    }

    return { getAllRecipeTags };
};

export default useRecipeTag;
