import { BrowserRouter, Routes, Route } from 'react-router-dom'

import AuthLayout from './layouts/AuthLayout'
import AppLayout from './layouts/AppLayout'
import AuthOutlet from '@auth-kit/react-router/AuthOutlet'

import Login from './pages/userPages/Login'
import SignUp from './pages/userPages/SignUp'
import ForgetPassword from './pages/userPages/ForgetPassword'
import NewPassword from './pages/userPages/NewPassword'
import AccountValidation from './pages/userPages/AccountValidation'
import Home from './pages/appPages/Home'
import RecipeBuilder from './pages/appPages/RecipeBuilder'
import MyRecipes from './pages/appPages/MyRecipes'
import AuthProvider from 'react-auth-kit';

import { store } from './utils/store';


function App() {
	return (
		<AuthProvider store={store}>
			<BrowserRouter>
				<Routes>
					<Route  element = {<AuthLayout/>}> 
						<Route path = "/" element = {<Login/>} />
						<Route path = "sign-up" element = {<SignUp/>} />
						<Route path = "forget-password" element = {<ForgetPassword/>} />
						<Route path = "forget-password/:token" element = {<NewPassword/>} />
						<Route path = "account-validation/:id" element = {<AccountValidation/>} />
					</Route>

					<Route element={<AuthOutlet fallbackPath='/' />}>
						<Route element = {<AppLayout/>}>
							<Route path='/app/home' element = {<Home/>}/>
							<Route path='/app/recipe-builder' element = {<RecipeBuilder/>}/>
							<Route path='/app/my-recipes' element = {<MyRecipes/>}/>
						</Route>
					</Route>
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	)
}

export default App