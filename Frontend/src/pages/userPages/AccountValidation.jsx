import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAccountValidation from "../../hooks/authUser/useAccountValidation";

const AccountValidation = () => {
    const [validationCorrect, setValidationCorrect] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const { validationAccount } = useAccountValidation();

    const handleLoginRedirect = () => {
        navigate("/");
    };

    useEffect(() => {
        const validate = async () => {
            const token = searchParams.get('token');
            const email = searchParams.get('email');
            const result = await validationAccount(token, email);
            setValidationCorrect(result.success);
        };

        validate(); 
        return
    }, []);

    return (
        <div>
            <div>
                <h1 className="text-sky-600 font-black text-6xl capitalize text-center">
                    <span style={{ color: "#00ADB5" }}>Account Validation</span>
                </h1>
                {validationCorrect ? (
                    <p className="text-center mt-8 text-2xl text-white capitalize">
                        Account validated successfully!
                    </p>
                ) : (
                    ""
                )}
                <div className="flex justify-center mt-8">
                    <button
                        onClick={handleLoginRedirect}
                        className="bg-sky-600 text-white py-2 px-4 rounded hover:bg-sky-700 transition duration-200"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountValidation;
