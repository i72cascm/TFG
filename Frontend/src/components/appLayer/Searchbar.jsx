import { useState } from 'react';
import bannerSearch from '/bannerSearch.jpg';

const Searchbar = ({ onSearch }) => {
    // Estados para manejar las selecciones del usuario
    const [sortByLikes, setSortByLikes] = useState(false);
    const [category, setCategory] = useState('');

    // Manejadores para los cambios de estado
    const handleSortByLikesChange = (event) => {
        setSortByLikes(event.target.checked);
    };

    const handleCategoryChange = (event) => {
        setCategory(event.target.value);
    };

    return (
        <div className="flex flex-col justify-center items-center bg-white rounded-b-2xl p-4"
        style={{
            width: '100%', 
            maxWidth: '4xl', 
            margin: 'auto', 
            backgroundImage: `url(${bannerSearch})`, 
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat'
        }}>
            <div className="w-full max-w-4xl mb-4 p-1">
                <form onSubmit={onSearch} className="flex items-center">
                    <input
                        type="text"
                        placeholder="Search for Recipes..."
                        className="flex-grow px-4 py-2 rounded-l border-2 border-r-0 bg-slate-200 border-gray-200 focus:outline-none focus:border-blue-300"
                    />
                    <button
                        type="submit"
                        className="bg-blue-300 text-white px-4 py-2 rounded-r border-2 border-blue-300 hover:bg-blue-400 focus:outline-none"
                    >
                        Search
                    </button>
                </form>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center w-full max-w-lg ">
                <div className='p-2 bg-white rounded-xl'>
                    <label className=" flex items-center space-x-2  rounded-md px-2 py-1 ">
                        <input
                            type="checkbox"
                            checked={sortByLikes}
                            onChange={handleSortByLikesChange}
                            className="form-checkbox cursor-pointer"
                        />
                        <span className='font-semibold'>Filter by most likes</span>
                    </label>
                </div>
                <div className='p-2 bg-white rounded-xl'>
                    <select
                        value={category}
                        onChange={handleCategoryChange}
                        className="font-semibold rounded px-2 py-1 focus:outline-none cursor-pointer"
                    >
                        <option className="font-semibold" value="">Select Recipe Type</option>
                        <option value="desayuno">Desayuno</option>
                        <option value="almuerzo">Almuerzo</option>
                        <option value="cena">Cena</option>
                        <option value="snack">Snack</option>
                    </select>
                </div>
            </div>    
        </div>
    );
}

export default Searchbar;
