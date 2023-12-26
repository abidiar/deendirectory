const Navbar = () => {
    return (
      <nav className="bg-blue-900 text-white p-4 flex justify-between items-center">
        <div className="text-xl font-bold">Your Logo Here</div>
        <div className="space-x-4">
          <a href="#services" className="hover:underline">Services</a>
          <a href="#restaurants" className="hover:underline">Restaurants</a>
          <a href="#professionals" className="hover:underline">Professionals</a>
          <a href="#about" className="hover:underline">About</a>
        </div>
      </nav>
    );
  };
  
  export default Navbar;
  