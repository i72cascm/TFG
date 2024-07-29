import React from "react";

const HealthyRecipeCard = ({recipe}) => {
    const { label, image, url } = recipe;

    const truncateLabel = (text, maxLength) => {
        if (text.length > maxLength) {
            return `${text.substring(0, maxLength)}...`; // Trunca el texto y añade puntos suspensivos
        }
        return text;
    };

    return (
        <div
            className="rounded-2xl"
            style={{ backgroundColor: "#00b570", zIndex: 800 }}
        >
            <div className="relative">
                <img
                    src={image}
                    alt="Healthy Recipe Image"
                    className="rounded-t-lg w-full h-52 object-cover"
                />
            </div>
            <div className="mt-3 font-medium text-center overflow-hidden text-ellipsis whitespace-nowrap px-4">
                <p className="mt-3 font-medium text-2xl">{truncateLabel(label, 20)}</p>
            </div>
            <div className="flex justify-center mb-5 mt-3">
                <a href={url} target="_blank" rel="noopener noreferrer" className="capitalize inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 border-2 border-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                    see blog entry
                </a>
            </div>
        </div>
    );
};

export default HealthyRecipeCard;
