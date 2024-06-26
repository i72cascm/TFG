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

    const getRecipesByUser = async (email) => {
        try {
            const response = await fetch(`${urlApi}/api/recipetag/${email}`, {
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

    const postRecipeTags = async (email ,tags) => {
        try {
            const response = await fetch(`${urlApi}/api/recipetag/${email}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
					"Authorization": userToken
                },
                body: JSON.stringify(tags),
            });

            if (response.status === 200) {
                return { success: true };
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error updating interest tags");
            }
        } catch (error) {
            console.error("Error updating interest tags:", error);
            throw new Error(error.message);
        }
    };

    const postRecipeTagsMutation = useMutation({
        mutationFn: ({ email, tags }) => postRecipeTags(email, tags),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['user-tags']
            });
        }
    })

    return { getAllRecipeTags, getRecipesByUser, postRecipeTagsMutation };
};

export default useRecipeTag;
