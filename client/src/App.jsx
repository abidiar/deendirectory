import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import MainLayout from './components/MainLayout'; // Includes NewNearYou
import Footer from './components/Footer';
import HomeServices from './components/HomeServices';
import SearchResultsPage from './components/SearchResultsPage'; // Make sure to import this
import BusinessPage from './components/BusinessPage'; // Business detail page

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-neutral-light">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<MainLayout />} /> {/* MainLayout includes NewNearYou */}
            <Route path="/home-services" element={<HomeServices />} />
            <Route path="/search-results" element={<SearchResultsPage />} /> {/* Search results route */}
            <Route path="/business/:id" element={<BusinessPage />} /> {/* Individual business route */}
            {/* Other routes can be added here as needed */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
