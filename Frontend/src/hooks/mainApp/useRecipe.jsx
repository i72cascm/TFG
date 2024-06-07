import { urlApi } from "../../constants/endpoint";

const useRecipe = () => {
	
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
            console.error("Error fetching recipes:", error);
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

    return { postRecipe, getAllRecipes, getUserRecipes };
};

export default useRecipe;
