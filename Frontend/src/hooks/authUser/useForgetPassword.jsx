import { urlApi } from '../../constants/endpoint';

const useForgetPassword = () => {
    const requestResetPassword = async (email) => {
        try {
            const url = `${urlApi}/api/auth/reset-password?email=${encodeURIComponent(email)}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.status === 200) {
                const data = await response.json();
                return { success: true, data };
            } else if (response.status === 404 || response.status === 500) {
                const errorData = await response.json();
                return { success: false, message: errorData.message };
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            return { success: false, message: error.message };
        }
    };

    const updatePassword = async (email, token, newPassword) => {
        try {
            const url = `${urlApi}/api/auth/update-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}&newPassword=${encodeURIComponent(newPassword)}`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    token: token,
                    newPassword: newPassword
                })
            });

            if (response.status === 200) {
                const data = await response.json();
                return { success: true, data };
            } else {
                const errorData = await response.json();
                return { success: false, message: errorData.message };
            }
        } catch (error) {
            console.error("Error updating password:", error);
            return { success: false, message: error.message };
        }
    };

    return { requestResetPassword, updatePassword };

};

export default useForgetPassword;
