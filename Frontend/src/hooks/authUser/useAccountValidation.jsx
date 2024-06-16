import { urlApi } from '../../constants/endpoint';

const useAccountValidation = () => {
    const validationAccount = async (token, email) => {
        try {
            const url = `${urlApi}/api/auth/validate-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.status === 200) {
                const data = await response.json();
                return { success: true, data };
            } else if (response.status === 400 || response.status === 500) {
                const errorData = await response.json();
                return { success: false, message: errorData.message };
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            return { success: false, message: error.message };
        }
    };

    return { validationAccount };
};

export default useAccountValidation;
