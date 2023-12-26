// Footer.js
const Footer = () => {
    return (
      <footer className="bg-blue-900 text-white text-center p-4 mt-auto">
        <div className="mb-2">
          <p>Sign up for free project cost information</p>
          <input type="email" placeholder="Email Address" className="mt-2 px-4 py-2 w-60"/>
          <button className="mt-2 px-4 py-2 bg-blue-700 hover:bg-blue-800">Sign Up</button>
        </div>
        <div className="flex justify-center space-x-4">
          {/* Social media icons */}
        </div>
      </footer>
    );
  };
  
  export default Footer;
  