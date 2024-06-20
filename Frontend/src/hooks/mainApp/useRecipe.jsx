import { urlApi } from "../../constants/endpoint";
import { useMutation, useQueryClient } from '@tanstack/react-query';

const useRecipe = () => {
	
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

    const getAllRecipes = async () => {
        try {
            const response = await fetch(`${urlApi}/api/recipe`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": userToken
                },
            });
    
            if (response.status === 200) {
                const data = await response.json();
                console.log(data)
                return { success: true, data };
            } else if (response.status === 400 || response.status === 500) {
                const errorData = await response.json();
                return { success: false, message: errorData.Message };
            }
        } catch (error) {
            console.error("Error fetching all recipes:", error);
            return { success: false, message: error.message };
        }
    }

    const getUserRecipes = async (userEmail) => {
        try {
            const response = await fetch(`${urlApi}/api/recipe/user/${userEmail}`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": userToken
                },
            });
    
            if (response.status === 200) {
                const data = await response.json();
                console.log(data)
                return { success: true, data };
            } else if (response.status === 400 || response.status === 500) {
                const errorData = await response.json();
                return { success: false, message: errorData.Message };
            }
        } catch (error) {
            console.error("Error fetching recipe by id:", error);
            return { success: false, message: error.message };
        }
    }

    const getRecipeById = async (id) => {
        try {
            const response = await fetch(`${urlApi}/api/recipe/${id}`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": userToken
                },
            });
    
            if (response.status === 200) {
                const data = await response.json();
                console.log(data)
                return { success: true, data };
            } else if (response.status === 400 || response.status === 500) {
                const errorData = await response.json();
                return { success: false, message: errorData.Message };
            }
        } catch (error) {
            console.error("Error fetching user recipes:", error);
            return { success: false, message: error.message };
        }
    }

    const postRecipe = async (recipeData) => {
        try {
            const response = await fetch(`${urlApi}/api/recipe`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
					"Authorization": userToken
                },
                body: JSON.stringify(recipeData),
            });

            if (response.status === 201) {
                return { success: true };
            } else if (response.status === 400 || response.status === 500) {
                const errorData = await response.json();
                return { success: false, message: errorData.Message };
            }
        } catch (error) {
            console.error("Error submitting recipe:", error);
            return { success: false, message: error.message };
        }
    };

    const postRecipeMutation = useMutation({
        mutationFn: postRecipe,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['user-recipes', 'recipes']
            });
        }
    })

    const deleteAllRecipesByUser = async (email) => {
        try {
            const response = await fetch(`${urlApi}/api/recipe/user/${email}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
					"Authorization": userToken
                },
            });

            if (response.status === 200) {
                return { success: true };
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error deleting recipes");
            }
        } catch (error) {
            console.error("Error deleting recipes:", error);
            throw new Error(error.message);
        }
    };

    const deleteAllRecipesByUserMutation = useMutation({
        mutationFn: deleteAllRecipesByUser,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['user-recipes', 'recipes']
            });
        }
    })

    return { postRecipeMutation, deleteAllRecipesByUserMutation, getAllRecipes, getUserRecipes, getRecipeById };
};

export default useRecipe;
