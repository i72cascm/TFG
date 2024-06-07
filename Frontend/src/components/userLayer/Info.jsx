const Info = ({info}) => {
    return (
        <div className="p-2 mt-2 mb-3 bg-blue-100 border border-blue-200 text-blue-800 rounded-xl relative" role="alert">        
            <span className="block sm:inline">{info.msgInfo}</span>
        </div>
    )
}

export default Info
