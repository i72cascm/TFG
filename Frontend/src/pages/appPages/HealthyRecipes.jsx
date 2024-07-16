import React from "react";

const HealthyRecipes = () => {
    return (
        <>
            <div className="min-w-[1000px] overflow-x-auto">
                <div className="flex justify-center mt-2 mb-7">
                    <h1 className="text-sky-600 font-black text-7xl col-span-2 capitalize">
                        healthy{" "}
                        <span style={{ color: "#00ADB5" }}>recipes searcher</span>
                    </h1>
                </div>
                <div className="grid grid-cols-[4fr,1fr] gap-4 mx-4">
                    <div className=" p-4 rounded-xl border-slate-700 bg-slate-700">
                        
                    </div>
                    <div>
                        <div className="flex flex-col overflow-y-auto h-[73.8vh] gap-2 mb-4 p-4 rounded-xl border-slate-700 bg-slate-700">
                            
                        </div>
                        <div>
                            
                            <button
                                
                                className="w-full xl:h-[10vh] sm:h-[20vh] rounded-xl p-5 border-4 font-bold text-3xl bg-white/70 hover:bg-gray-100 active:bg-gray-400 transition duration-200 ease-in-out"
                                style={{ borderColor: "#222831" }}
                            >
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HealthyRecipes;
