import { useState } from 'react';
import { urlApi } from '../../constants/endpoint';

const useSignUp = (setSignUpCorrect) => {
    const [ name, setName ] = useState('')
    const [ lastnames, setLastnames ] = useState('')
    const [ birthdate, setBirthdate ] = useState('')
    const [ email, setEmail ] = useState('')
    const [ username, setUsername ] = useState('')
    const [ password, setPassword ] = useState('')
    const [ repeatPassword, setRepeatPassword ] = useState('')
    const [ alert, setAlert ] = useState({})

    const validateFields = () => {
        
        // Control de campos vacíos
        if([name, lastnames, birthdate, email, username, password, repeatPassword].includes('')){
            setAlert({
                msgAlert: 'All fields are required',
                error: true
            })
            return false;
        }

        // Validación de edad
        const dateFormat = new Date(birthdate);
        const now = new Date();
        const userAge = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());
        const old = new Date('1900-01-01');
        if((dateFormat <= old) || (dateFormat >= userAge)){
            setAlert({
                msgAlert: 'Invalid age',
                error: true
            })
            return false;
        }

        // Control de formato de email
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        if(!emailRegex.test(email)) {
            setAlert({
                msgAlert: 'The email address is invalid',
                error: true
            })
            return false;
        }

        // Control de formato de username
        if (!(username.length >= 3 && username.length <= 20) || (!/^[a-zA-Z0-9]+[a-zA-Z0-9_]*[a-zA-Z0-9]+$/.test(username)) || (/.*__+.*/.test(username))) {
            setAlert({
                msgAlert: 'The username is invalid',
                error: true
            })
            return false;
        }

        // Control de formato de password
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/;
        if(!passwordRegex.test(password)) {
            setAlert({
                msgAlert: 'The password is invalid',
                error: true
            })
            return false;
        }

        // Control de password igual
        if(password !== repeatPassword){
            setAlert({
                msgAlert: 'Both passwords are different',
                error: true
            })
            return false;
        }

        // Si todas las validaciones han sido superadas, return true
        return true;
    };

    // Crear usuario a través del backend
    const createUser = async () => {

        if (!validateFields()) return;

        const userData = {
            name,
            lastnames,
            birthdate,
            email,
            username,
            password,
        };

        try {
            const response = await fetch(`${urlApi}/api/Auth`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            // En caso de respuesta no existosa
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error while creating new user');   
            }

            // En caso de respuesta exitosa
            setSignUpCorrect(true);
            
        } catch (error) {
            console.error('Error creating user: ', error.message);
            setAlert({
                msgAlert: error.message,
                error: true
            });           
        }
    }

    return {
        name, setName,
        lastnames, setLastnames,  
        birthdate, setBirthdate,
        email, setEmail,
        username, setUsername,
        password, setPassword,
        repeatPassword, setRepeatPassword,
        alert, createUser
    };
};

export default useSignUp;