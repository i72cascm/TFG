import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserSettings = () => {
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        lastName: '',
        userName: '',
        password: '',
        birthDate: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const requiredFields = ['email', 'name', 'lastName', 'userName', 'password', 'birthDate'];
        const emptyField = requiredFields.some(field => !formData[field]);

        if (emptyField) {
            toast.error("Please fill in all fields.");
        } else {
            console.log('Submitting User Data:', formData);
            toast.success("Settings updated successfully!");
        }
    };

    return (
        <>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false}
                newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <div className="flex justify-center mt-2 mb-7">
                <h1 className="text-sky-600 font-black text-7xl">User Settings</h1>
            </div>
            <div className="flex justify-center">
                <form onSubmit={handleSubmit} className="p-5 bg-gray-200 shadow-md rounded-lg w-full max-w-4xl">
                    <div className="grid grid-cols-1 gap-6">
                        {[
                            { label: 'Email', type: 'email', name: 'email' },
                            { label: 'Name', type: 'text', name: 'name' },
                            { label: 'Last Name', type: 'text', name: 'lastName' },
                            { label: 'Username', type: 'text', name: 'userName' },
                            { label: 'Password', type: 'password', name: 'password' },
                            { label: 'Birth Date', type: 'date', name: 'birthDate' },
                        ].map(field => (
                            <div key={field.name}>
                                <label className="font-bold text-gray-700">{field.label}</label>
                                <input type={field.type} name={field.name} value={formData[field.name]}
                                    onChange={handleChange} className="w-full p-2 mt-2 border rounded-md" />
                            </div>
                        ))}
                    </div>
                    <button type="submit" className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        Update Settings
                    </button>
                </form>
            </div>
        </>
    );
};

export default UserSettings;
