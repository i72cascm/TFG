
import { useState } from 'react';
import { ArrowBack, ArrowForward } from '@mui/icons-material';

const Pagination = ({ page, totalPages, setPage, isPlaceholderData }) => {

    const [pageChange, setPageChange] = useState("");

    const handlePreviousPage = () => {
        setPage(Math.max(page - 1, 1));
    };

    const handlePageChange = (e) => {
        const newValue = e.target.value;
        // Permitir solo números y vaciar el campo
        if (newValue === "" || /^\d+$/.test(newValue)) {
            setPageChange(newValue);
        }
    };

    const handleNextPage = () => {
        if (!isPlaceholderData && page < totalPages) {
            setPage(page + 1);
        }
    };

    const handlePageChangeSubmit = (e) => {
        e.preventDefault();
        const newPage = parseInt(pageChange, 10);
        if (!isNaN(newPage) && newPage > 0 && newPage <= totalPages) {
            setPage(newPage);
            setPageChange("");
        }
    }

    return (
        <div className="flex justify-center mt-2 text-white">
            <div className='inline-block text-center mt-4 border-gray-300 rounded-lg'>
                <button
                    onClick={handlePreviousPage}
                    disabled={page === 1}
                    className="px-4 py-1 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ArrowBack />
                </button>
                <span className='mx-2'>
                    {page} / {totalPages}
                </span>
                <button
                    onClick={handleNextPage}
                    disabled={isPlaceholderData || page >= totalPages}
                    className="px-4 py-1 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ArrowForward />
                </button>
                <div className="flex items-cente border-gray-300 mt-2 px-4 pb-2">
                    <label className='mr-4'>Go to page: </label>
                    <form onSubmit={handlePageChangeSubmit}>
                        <input
                            type="text"
                            id="changePage"
                            name="changePage"
                            min="1"
                            step="1"
                            autoComplete="off"
                            value={pageChange}
                            onChange={handlePageChange}
                            className="bg-indigo-200 w-9 text-center rounded-md appearance-none text-black"
                        />
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Pagination