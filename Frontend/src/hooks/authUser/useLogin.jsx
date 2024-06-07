import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import useSignIn from 'react-auth-kit/hooks/useSignIn';
import { urlApi } from '../../constants/endpoint';

const useLogin = () => {
    const [userOrEmail, setUserOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [alert, setAlert] = useState({});
    const navigate = useNavigate();
    const signIn = useSignIn();

    const loginUser = async () => {
        // Set error en alerta en caso de campos vacíos
        if ([userOrEmail, password].includes('')) {
            setAlert({
                msgAlert: 'All fields are required',
                error: true
            });
            return;
        }

        setAlert({}); // Limpiar errores de alerta previas

        // Consular si esos credenciasles existen en BD y en caso afirmativo, obtener del back el token, id y username para setearlo en las cookies de la App web
        try {
            const response = await fetch(`${urlApi}/api/Auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userOrEmail, password }),
            });

            // Si no hay respuesta correcta desde el back, error
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error while logging in');
            }

            // Setear el retorno del back en las cookies de la web
            const result = await response.json();
            signIn({
                auth: {
                    token: result.token,
                    expiresIn: 3600,
                    type: 'Bearer',
                },
                userState: {
                    name: result.userName,
                    email: result.email
                }
            });

            setUserOrEmail('');
            setPassword('');

            // Ir a la home page con el usuario logeado (cookies)
            navigate(`/app/home`);
        } catch (error) {
            // Manejo de errores
            console.error('Error logging user: ', error.message);
            setAlert({
                msgAlert: error.message,
                error: true
            });
        }
    };

    return {
        userOrEmail,
        setUserOrEmail,
        password,
        setPassword,
        alert,
        loginUser
    };
};

export default useLogin;