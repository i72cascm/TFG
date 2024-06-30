import React, { useState, useEffect } from "react";

// Ajusta para recibir y usar correctamente el objeto `list`:
const ShoppingListRow = ({ isActive, onClick, index, list }) => {
    const activeColor = "#00ADB5";
    const defaultColor = "rgba(69, 182, 167, 0.534)";
    const hoverColor = "rgba(75, 192, 176, 0.623)";

    const [bgColor, setBgColor] = useState(defaultColor);

    useEffect(() => {
        setBgColor(isActive ? activeColor : defaultColor);
    }, [isActive]);

    return (
        <button
            className="flex justify-center items-center max-h-20 min-h-20 rounded-xl border-4"
            style={{
                backgroundColor: isActive ? activeColor : bgColor,
                borderColor: "#222831",
                transition: "background-color 0.3s ease",
            }}
            onMouseEnter={() => setBgColor(hoverColor)}
            onMouseLeave={() => setBgColor(isActive ? activeColor : defaultColor)}
            onMouseDown={() => onClick(index)}
        >
            <h1 className="text-xl font-semibold">{list.shoppingListName}</h1>
        </button>
    );
};

export default ShoppingListRow;

