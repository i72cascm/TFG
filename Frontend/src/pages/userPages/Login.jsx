import { Link } from 'react-router-dom'
import Alert from '../../components/userLayer/Alert'
import useLogin from '../../hooks/authUser/useLogin';

const Login = () => {

    const { userOrEmail, setUserOrEmail, password, setPassword, alert, loginUser } = useLogin();

    const handleSubmit = e => {
        e.preventDefault();
        loginUser();
    };

    return (
        <>
            <h1 className="text-sky-600 font-black text-6xl capitalize">Login and create your <span style={{ color: "#00ADB5" }}>recipes</span></h1>

            <form 
                className="my-10 bg-white shadow rounded-lg px-10 py-5"
                onSubmit={handleSubmit}    
            >
                <div className="my-2">
                    <label 
                        className="uppercase text-gray-600 block text-xl font-bold"
                        htmlFor="email_username">
                        Email or Username
                    </label>
                    <input
                        id="email_username"
                        type="email_username"
                        placeholder="Email or Username"
                        className="w-full mt-3 p-3 border rounded-xl bg-gray-50"
                        value={userOrEmail}
                        onChange={e => setUserOrEmail(e.target.value)}
                    />
                </div>                
                <div className="my-2">
                    <label 
                        className="uppercase text-gray-600 block text-xl font-bold"
                        htmlFor="password">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Password"
                        autoComplete='on'
                        className="w-full mt-3 p-3 border rounded-xl bg-gray-50"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                </div>

                <input
                    type="submit"
                    value="Login"
                    className="bg-sky-700 w-full py-3 mt-2 text-white uppercase font-bold rounded hover:cursor-pointer hover:bg-sky-800 transition-colors"
                />
            </form>

            {alert.msgAlert && <Alert alert={alert}/>}

            <nav className="lg:flex lg:justify-between">
                <Link
                    className='block text-center my-5 text-slate-500 uppercase text-sm'
                    to="/sign-up"                
                >Dont have an account? Create an account</Link>

                <Link
                    className='block text-center my-5 text-slate-500 uppercase text-sm'
                    to="/forget-password"                
                >Forgot your password?</Link>
            </nav>
        </>
    )
}

export default Login