import { Link } from 'react-router-dom'

const NewPassword = () => {
    return (
        <>
            <h1 className="text-sky-600 font-black text-6xl capitalize">Register your account and create your <span style={{ color: "#00ADB5" }}>recipes</span></h1>

            <form className="my-10 bg-white shadow rounded-lg px-10 py-5">
            
                <div className="my-2">
                    <label 
                        className="uppercase text-gray-600 block text-xl font-bold"
                        htmlFor="password">
                        New Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Enter your New Password"
                        className="w-full mt-3 p-3 border rounded-xl bg-gray-50"
                    />
                </div>
                
                <input
                    type="submit"
                    value="Save New Password"
                    className="bg-sky-700 w-full py-3 text-white uppercase font-bold rounded hover:cursor-pointer hover:bg-sky-800 transition-colors"
                />
            </form>

            <nav className="lg:flex lg:justify-between">
                <Link
                    className='block text-center my-5 text-slate-500 uppercase text-sm'
                    to="/"                
                >Alredy have an account? Sign in</Link>

				<Link
                    className='block text-center my-5 text-slate-500 uppercase text-sm'
                    to="/sign-up"                
                >Dont have an account? Create an account</Link>
            </nav>

            
        </>
    )
}

export default NewPassword
