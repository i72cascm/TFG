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

    const getUserByEmail = async (email) => {
        try {
            const response = await fetch(`${urlApi}/api/user/${email}`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": userToken
                },
            });
    
            if (response.status === 200) {
                const data = await response.json();
                return { success: true, data };
            } else if (response.status === 404 || response.status === 500) {
                const errorData = await response.json();
                return { success: false, message: errorData.Message };
            }
        } catch (error) {
            console.error("Error fetching user by email:", error);
            return { success: false, message: error.message };
        }
    }

    const putUser = async (email, userData) => {
        try {
            const response = await fetch(`${urlApi}/api/user/${email}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: userToken,
                },
                body: JSON.stringify(userData),
            });

            if (response.status === 200) {
                const data = await response.json();
                return { success: true, data };
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error updating user");
            }
        } catch (error) {
            console.error("Error updating user:", error);
            throw new Error(error.message);
        }
    };

    const putUserMutation = useMutation({
        mutationFn: ({ email, userData }) => putUser(email, userData),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['user-settings']
            });
        },
    });

    const deleteUser = async (email) => {
        try {
            const response = await fetch(`${urlApi}/api/user/${email}`, {
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
                throw new Error(errorData.message || "Error deleting user");
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            throw new Error(error.message);
        }
    };
    
    const deleteUserMutation = useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['user-settings']
            });
        },
    });

    return { getUserByEmail, putUserMutation, deleteUserMutation };
};

export default useRecipe;
