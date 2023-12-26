// SearchBar.js
const SearchBar = () => {
  return (
    <div className="flex justify-center items-center my-6">
      <div className="flex border-2 rounded">
        <input type="text" className="px-4 py-2 w-80" placeholder="Search..."/>
        <button className="flex items-center justify-center px-4 border-l">
          <svg className="w-6 h-6 text-gray-600" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M10,2A8,8,0,1,0,18,10,8,8,0,0,0,10,2Zm0,14a6,6,0,1,1,6-6A6,6,0,0,1,10,16Z"/>
            <path d="M21,21l-4.35-4.35"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
