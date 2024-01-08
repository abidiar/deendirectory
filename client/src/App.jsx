import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import MainLayout from './components/MainLayout'; // Includes NewNearYou
import Footer from './components/Footer';
import HomeServices from './components/HomeServices';
import SearchResultsPage from './components/SearchResultsPage'; // Make sure to import this
import BusinessPage from './components/BusinessPage'; // Business detail page
import Babysitters from './components/Babysitters'; // Placeholder import
import Cleaners from './components/Cleaners';
import SubcategoryPage from './components/SubcategoryPage'; // Import the SubcategoryPage component
import CategoryPage from './components/CategoryPage'; // Import the CategoryPage component

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-neutral-light">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<MainLayout />} />
            <Route path="/home-services" element={<HomeServices />} />
            <Route path="/home-services/babysitters" element={<Babysitters />} />
            <Route path="/home-services/cleaners" element={<Cleaners />} />
            <Route path="/search-results" element={<SearchResultsPage />} />
            <Route path="/business/:id" element={<BusinessPage />} />
            <Route path="/subcategory/:subcategoryId" element={<SubcategoryPage />} />
            <Route path="/category/:categoryId" element={<CategoryPage />} /> {/* New route for CategoryPage */}
            {/* Add other routes as needed */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
