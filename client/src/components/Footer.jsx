// Footer.js
import React from 'react';
import { FaTwitter, FaFacebook, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-primary-dark text-white">
      <div className="container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-xl font-bold mb-4">DeenDirectory</p>
            {/* Add additional text or logo here */}
          </div>

          <div>
            <h6 className="uppercase font-semibold mb-4">Useful Links</h6>
            <ul className="space-y-2">
              <li><a href="#!" className="hover:text-accent-sky">About Us</a></li>
              <li><a href="#!" className="hover:text-accent-sky">Contact</a></li>
              <li><a href="#!" className="hover:text-accent-sky">Support</a></li>
              {/* Add more links as needed */}
            </ul>
          </div>

          <div>
            <h6 className="uppercase font-semibold mb-4">Legal</h6>
            <ul className="space-y-2">
              <li><a href="#!" className="hover:text-accent-sky">Terms of Use</a></li>
              <li><a href="#!" className="hover:text-accent-sky">Privacy Policy</a></li>
              <li><a href="#!" className="hover:text-accent-sky">License</a></li>
              {/* Add more legal links as needed */}
            </ul>
          </div>

          <div>
            <h6 className="uppercase font-semibold mb-4">Social Media</h6>
            <div className="flex justify-start space-x-4">
              {/* Populate with your actual social media links */}
              <a href="#!" className="hover:text-accent-sky"><FaTwitter /></a>
              <a href="#!" className="hover:text-accent-sky"><FaFacebook /></a>
              <a href="#!" className="hover:text-accent-sky"><FaInstagram /></a>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center p-4 bg-primary-dark mt-6">
        © {new Date().getFullYear()} DeenDirectory. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
