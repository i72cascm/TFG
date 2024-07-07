import { urlApi } from "../../constants/endpoint";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useComment = () => {
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

    const getComments = async (recipeId) => {
        try {
            const response = await fetch(`${urlApi}/api/comment/${recipeId}`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": userToken
                },
            });
    
            if (response.status === 200) {
                const data = await response.json();
                return data;
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error getting comments of recipe");
            }
        } catch (error) {
            console.error("Error getting comments of recipe:", error);
            throw new Error(error.message);
        }
    }

    const postComment = async (data) => {
        try {
            const userName = data.userName;
            
            const response = await fetch(`${urlApi}/api/comment/${userName}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": userToken
                },
                body: JSON.stringify({
                    RecipeID: data.recipeId,
                    Comment: data.comment,
                    ParentCommentID: data.parentCommentId
                })
            });
    
            if (response.status === 204) {
                return { success: true };
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error posting comment");
            }
        } catch (error) {
            console.error("Error posting comment:", error);
            throw new Error(error.message);
        }
    };

    const postCommentMutation = useMutation({
        mutationFn: postComment,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['recipe-comments']
            });
        }
    })

    const deleteComment = async (commentId) => {
        try {
            const response = await fetch(`${urlApi}/api/comment/${commentId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": userToken
                }
            });
    
            if (response.status === 204) {
                return { success: true };
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error deleting comment");
            }
        } catch (error) {
            console.error("Error deleting comment:", error);
            throw new Error(error.message);
        }
    };

    const deleteCommentMutation = useMutation({
        mutationFn: deleteComment,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['recipe-comments']
            });
        }
    })


    return { postCommentMutation, deleteCommentMutation };
};

export default useComment;