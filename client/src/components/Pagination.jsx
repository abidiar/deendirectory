import React from 'react';
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

  const createPaginationControls = () => {
    let paginationControls = [];
    for (let i = 1; i <= totalPages; i++) {
      paginationControls.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          disabled={i === currentPage}
          className={`p-2 ${i === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded mx-1`}
        >
          {i}
        </button>
      );
    }
    return paginationControls;
  };

  return (
    <div className="flex justify-center my-4">
      <button
        onClick={() => goToPage(1)}
        disabled={currentPage === 1}
        className="p-2 bg-gray-200 rounded mx-1"
      >
        First
      </button>
      <button
        onClick={() => goToPage(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="p-2 bg-gray-200 rounded mx-1"
      >
        Previous
      </button>
      {createPaginationControls()}
      <button
        onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="p-2 bg-gray-200 rounded mx-1"
      >
        Next
      </button>
      <button
        onClick={() => goToPage(totalPages)}
        disabled={currentPage === totalPages}
        className="p-2 bg-gray-200 rounded mx-1"
      >
        Last
      </button>
    </div>
  );
};

export default Pagination;
