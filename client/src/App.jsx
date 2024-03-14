import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LocationProvider } from './context/LocationContext'; // Import LocationProvider
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider
import './App.css';
import Navbar from './components/Navbar';
import MainLayout from './components/MainLayout';
import Footer from './components/Footer';
import HomeServices from './components/HomeServices';
import SearchResultsPage from './components/SearchResultsPage';
import BusinessPage from './components/BusinessPage';
import Babysitters from './components/Babysitters';
import Cleaners from './components/Cleaners';
import SubcategoryPage from './components/SubcategoryPage';
import CategoryPage from './components/CategoryPage';
import AddServicePage from './pages/AddServicePage';
import UserSignIn from './components/UserSignIn'; // Ensure this is the correct path
import BusinessSignIn from './components/BusinessSignIn'; // Ensure this is the correct path

function App() {
  return (
    <Router>
      <AuthProvider> {/* Correctly placed AuthProvider for authentication context */}
        <LocationProvider> {/* Ensure location-based services are correctly handled */}
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
                <Route path="/category/:categoryId" element={<CategoryPage />} />
                <Route path="/add-service" element={<AddServicePage />} />
                <Route path="/sign-in" element={<UserSignIn />} /> {/* Updated to UserSignIn */}
                <Route path="/business-sign-in" element={<BusinessSignIn />} />
                {/* Add other routes as needed */}
              </Routes>
            </main>
            <Footer />
          </div>
        </LocationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
