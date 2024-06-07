import { useState } from 'react'
import {Link, useNavigate} from 'react-router-dom'
import Alert from '../../components/userLayer/Alert'
import Info from '../../components/userLayer/Info'
import useSignUp from '../../hooks/authUser/useSignUp'

const SignUp = () => {
    const [ isPasswordFocused, setIsPasswordFocused ] = useState(false);
    const [ isUsernameFocused, setIsUsernameFocused ] = useState(false);

    const {
        name, setName,
        lastnames, setLastnames,
        birthdate, setBirthdate,
        email, setEmail,
        username, setUsername,
        password, setPassword,
        repeatPassword, setRepeatPassword,
        alert, createUser
    } = useSignUp();

    const handleSubmit = (e) => {
        e.preventDefault();
        createUser();
    };

    // Estructura y diseño de la página
    return (
        <>
            <h1 className="text-sky-600 font-black text-5xl capitalize">Register your account and create your <span style={{ color: "#00ADB5" }}>recipes</span></h1>

            <form 
                className="my-5 bg-white shadow rounded-lg px-10 py-5"
                onSubmit={handleSubmit}
            >

                <div className="my-2">
                    <label 
                        className="uppercase text-gray-600 block text-xl font-bold"
                        htmlFor="name">
                        Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        placeholder="Enter your Name"
                        className="w-full mt-2 p-2 border rounded-xl bg-gray-50"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                </div>

                <div className="my-2">
                    <label 
                        className="uppercase text-gray-600 block text-xl font-bold"
                        htmlFor="lastnames">
                        Last Names
                    </label>
                    <input
                        id="lastnames"
                        type="text"
                        placeholder="Enter your Last Names"
                        className="w-full mt-2 p-2 border rounded-xl bg-gray-50"
                        value={lastnames}
                        onChange={e => setLastnames(e.target.value)}
                    />
                </div>

                <div className="my-2">
                    <label 
                        className="uppercase text-gray-600 block text-xl font-bold"
                        htmlFor="birthdate">
                        Birthdate
                    </label>
                    <input
                        id="birthdate"
                        type="date"
                        placeholder="Enter your Last Names"
                        className="w-full mt-2 p-2 border rounded-xl bg-gray-50"
                        value={birthdate}
                        onChange={e => setBirthdate(e.target.value)}
                    />
                </div>

                <div className="my-2">
                    <label 
                        className="uppercase text-gray-600 block text-xl font-bold"
                        htmlFor="email">
                        Email
                    </label>
                    <input
                        id="email"
                        type="text"
                        placeholder="Enter your Email"
                        className="w-full mt-2 p-2 border rounded-xl bg-gray-50"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                </div>

                <div className="my-2">
                    <label 
                        className="uppercase text-gray-600 block text-xl font-bold"
                        htmlFor="username">
                        Username
                    </label>
                    {isUsernameFocused && (
                        <Info info={{msgInfo: "Your username must be 3 to 20 characters long, start and end with a letter or number, include underscores (no consecutive ones)."}} />
                    )}
                    <input
                        id="username"
                        type="text"
                        placeholder="Enter your Username"
                        className="w-full mt-2 p-2 border rounded-xl bg-gray-50"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        onFocus={() => setIsUsernameFocused(true)}
                        onBlur={() => setIsUsernameFocused(false)}
                    />
                </div>

                <div className="my-2">
                    <label 
                        className="uppercase text-gray-600 block text-xl font-bold"
                        htmlFor="password">
                        Password
                    </label>
                    {isPasswordFocused && (
                        <Info info={{msgInfo: "Your password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character."}} />
                    )}
                    <input
                        id="password"
                        type="password"
                        autoComplete='on'
                        placeholder="Enter your Password"
                        className="w-full mt-2 p-2 border rounded-xl bg-gray-50"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => setIsPasswordFocused(false)}
                    />
                </div>

                <div className="my-2">
                    <label 
                        className="uppercase text-gray-600 block text-xl font-bold"
                        htmlFor="password2">
                        Repeat password
                    </label>
                    <input
                        id="password2"
                        type="password"
                        autoComplete='on'
                        placeholder="Enter your Password again"
                        className="w-full mt-2 p-2 border rounded-xl bg-gray-50"
                        value={repeatPassword}
                        onChange={e => setRepeatPassword(e.target.value)}
                    />
                </div>

                <input
                    type="submit"
                    value="Create Account"
                    className="bg-sky-700 w-full py-2 mt-2 text-white uppercase font-bold rounded hover:cursor-pointer hover:bg-sky-800 transition-colors"
                />
            </form>

            {alert.msgAlert && <Alert alert={alert}/>}

            <nav className="lg:flex lg:justify-between">
                <Link
                    className='block text-center my-1 text-slate-500 uppercase text-sm'
                    to="/"                
                >Alredy have an account? Sign in</Link>

                <Link
                    className='block text-center my-1 text-slate-500 uppercase text-sm'
                    to="/forget-password"                
                >Forgot your password?</Link>
            </nav>
        </>
    )
}

export default SignUp