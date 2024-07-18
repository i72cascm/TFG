import { urlApi } from "../../constants/endpoint";

const useHealthyRecipe = () => {
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

    const getHealthyRecipes = async (searchInput, selectedTags) => {
        try {
            const response = await fetch(`${urlApi}/api/edamam`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: userToken,
                },
                body: JSON.stringify({ query: searchInput, tags: selectedTags })
            });

            if (response.status === 200) {
                const data = await response.json();
                console.log(data);
                return { success: true, data };
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error fetching healthy recipes");
            }
        } catch (error) {
            console.error("Error fetching healthy recipes:", error);
            return { success: false, message: error.message };
        }
    }

    return { getHealthyRecipes };
};

export default useHealthyRecipe;
