import React from 'react';
import { Link } from 'react-router-dom';
import { FaTwitter, FaFacebook, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-primary-dark text-white">
      <div className="container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div>
            <Link to="/" className="text-xl font-bold mb-4 hover:text-accent-sky">
              DeenDirectory
            </Link>
            {/* Add additional text or logo here */}
          </div>
          <div>
            <h6 className="uppercase font-semibold mb-4">Useful Links</h6>
            <ul className="space-y-2">
              <li>
                <Link to="/about-us" className="hover:text-accent-sky">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact-us" className="hover:text-accent-sky">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-accent-sky">
                  Support
                </Link>
              </li>
              {/* Add more links as needed */}
            </ul>
          </div>
          <div>
            <h6 className="uppercase font-semibold mb-4">Legal</h6>
            <ul className="space-y-2">
              <li>
                <Link to="/terms-of-use" className="hover:text-accent-sky">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-accent-sky">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/license" className="hover:text-accent-sky">
                  License
                </Link>
              </li>
              {/* Add more legal links as needed */}
            </ul>
          </div>
          <div>
            <h6 className="uppercase font-semibold mb-4">Social Media</h6>
            <div className="flex justify-start space-x-4">
              {/* Populate with your actual social media links */}
              <a
                href="https://twitter.com/deendirectory"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent-sky"
              >
                <FaTwitter />
              </a>
              <a
                href="https://facebook.com/deendirectory"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent-sky"
              >
                <FaFacebook />
              </a>
              <a
                href="https://instagram.com/deendirectory"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent-sky"
              >
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="text-center p-4 bg-primary-dark mt-6">
        &copy; {new Date().getFullYear()} DeenDirectory. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;