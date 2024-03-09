import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Pagination = ({ currentPage, totalPages, pageSize }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const goToPage = (newPage) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('page', newPage);
    if (pageSize) {
      searchParams.set('pageSize', pageSize);
    }
    navigate(`${location.pathname}?${searchParams.toString()}`);
  };

  // useMemo for performance optimization
  const paginationControls = useMemo(() => {
    let controls = [];
    for (let i = 1; i <= totalPages; i++) {
      controls.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          disabled={i === currentPage}
          className={`p-2 ${i === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'} rounded mx-1 cursor-pointer`}
          aria-label={`Go to page ${i}`}
        >
          {i}
        </button>
      );
    }
    return controls;
  }, [currentPage, totalPages, goToPage]);

  return (
    <div className="flex justify-center my-4">
      {/* First and Previous Buttons */}
      <button
        onClick={() => goToPage(1)}
        disabled={currentPage === 1}
        className="p-2 bg-gray-200 hover:bg-gray-300 rounded mx-1 cursor-pointer"
        aria-label="Go to first page"
      >
        First
      </button>
      <button
        onClick={() => goToPage(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="p-2 bg-gray-200 hover:bg-gray-300 rounded mx-1 cursor-pointer"
        aria-label="Go to previous page"
      >
        Previous
      </button>

      {/* Page Number Buttons */}
      {paginationControls}

      {/* Next and Last Buttons */}
      <button
        onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="p-2 bg-gray-200 hover:bg-gray-300 rounded mx-1 cursor-pointer"
        aria-label="Go to next page"
      >
        Next
      </button>
      <button
        onClick={() => goToPage(totalPages)}
        disabled={currentPage === totalPages}
        className="p-2 bg-gray-200 hover:bg-gray-300 rounded mx-1 cursor-pointer"
        aria-label="Go to last page"
      >
        Last
      </button>
    </div>
  );
};

export default Pagination;
