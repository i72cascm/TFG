import { urlApi } from "../../constants/endpoint";
import { useMutation, useQueryClient } from '@tanstack/react-query';

const useWeeklyPlanner = () => {
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
    
    const getAllEvents = async () => {
        try {
            const response = await fetch(`${urlApi}/api/weeklyplanner`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": userToken
                },
            });
    
            if (response.status === 200) {
                const data = await response.json();
            console.log(data);
            // Convertir las fechas de string a Date
            const eventsWithDateObjects = data.map(event => ({
                ...event,
                start: new Date(event.start),
                end: new Date(event.end)
            }));
            return eventsWithDateObjects;
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error getting all events");
            }
        } catch (error) {
            console.error("Error getting all events:", error);
            throw new Error(error.message);
        }
    }

    return { getAllEvents };
};

export default useWeeklyPlanner;
