import { urlApi } from "../../constants/endpoint";
import { useMutation, useQueryClient } from '@tanstack/react-query';

const useLike = () => {
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
    
    const postLike = async (data) => {
        try {
            const userName = data.userName;
            const recipeId = data.recipeId
            const response = await fetch(`${urlApi}/api/like/${userName}?recipeId=${recipeId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": userToken
                }
            });
    
            if (response.status === 200) {
                return { success: true };
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error giving like");
            }
        } catch (error) {
            console.error("Error giving like:", error);
            throw new Error(error.message);
        }
    };

    const postLikeMutation = useMutation({
        mutationFn: postLike,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['recipe-likes']
            });
        }
    })

    const deleteLike = async (data) => {
        try {
            const userName = data.userName;
            const recipeId = data.recipeId
            const response = await fetch(`${urlApi}/api/like/${userName}?recipeId=${recipeId}`, {
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
                throw new Error(errorData.message || "Error removing like");
            }
        } catch (error) {
            console.error("Error removing like:", error);
            throw new Error(error.message);
        }
    };

    const deleteLikeMutation = useMutation({
        mutationFn: deleteLike,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['recipe-likes']
            });
        }
    })


    return { postLikeMutation, deleteLikeMutation };
}

export default useLike