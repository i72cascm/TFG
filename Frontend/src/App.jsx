import { BrowserRouter, Routes, Route } from 'react-router-dom';

import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';
import AuthOutlet from '@auth-kit/react-router/AuthOutlet';

import Login from './pages/userPages/Login';
import SignUp from './pages/userPages/SignUp';
import ForgetPassword from './pages/userPages/ForgetPassword';
import NewPassword from './pages/userPages/NewPassword';
import AccountValidation from './pages/userPages/AccountValidation';
import Home from './pages/appPages/Home';
import RecipeBuilder from './pages/appPages/RecipeBuilder';
import MyRecipes from './pages/appPages/MyRecipes';
import Recipe from './pages/appPages/Recipe';
import UserSettings from './pages/appPages/UserSettings';
import ShoppingLists from './pages/appPages/ShoppingLists';
import WeeklyPlanner from './pages/appPages/WeeklyPlanner';
import HealthyRecipes from './pages/appPages/HealthyRecipes';
import AdminPanel from './pages/appPages/AdminPanel';
import AdminApproval from './pages/appPages/AdminApproval';

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
						<Route path = "new-password" element = {<NewPassword/>} />
						<Route path = "account-validation" element = {<AccountValidation/>} />
					</Route>

					<Route element={<AuthOutlet fallbackPath='/' />}>
						<Route element = {<AppLayout/>}>
							<Route path='/app/home' element = {<Home/>}/>
							<Route path='/app/recipe-builder' element = {<RecipeBuilder/>}/>
							<Route path='/app/my-recipes' element = {<MyRecipes/>}/>
							<Route path='/app/recipe/:id' element={<Recipe/>} />				
							<Route path='/app/shopping-lists' element={<ShoppingLists/>}/>
							<Route path='/app/weekly-planner' element={<WeeklyPlanner/>}/>
							<Route path='/app/healthy-recipes' element={<HealthyRecipes/>}/>
							<Route path='/app/user-settings' element={<UserSettings/>}/>
							<Route path='/app/admin-panel' element={<AdminPanel/>}/>
							<Route path='/app/admin-approval/:id' element={<AdminApproval/>}/>
						</Route>
					</Route>
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	)
}

export default App