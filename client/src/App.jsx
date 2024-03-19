import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { supabase } from './services/supabaseClient'; 
import { LocationProvider } from './context/LocationContext'; 
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Static imports
import MainLayout from './components/MainLayout';
import BusinessSignIn from './components/BusinessSignIn';
import UserSignIn from './components/UserSignIn';
import DashboardComponent from './components/DashboardComponent';
import HomeServices from './components/HomeServices';
import SearchResultsPage from './components/SearchResultsPage';
import BusinessPage from './components/BusinessPage';
import Babysitters from './components/Babysitters';
import Cleaners from './components/Cleaners';
import SubcategoryPage from './components/SubcategoryPage';
import CategoryPage from './components/CategoryPage';
import AddServicePage from './pages/AddServicePage';

function App() {
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(false); // Initially false, set true if needed

  useEffect(() => {
    // Accessing session as a property
    setSession(supabase.auth.session);

    // Listening for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });

    // Correctly handling the cleanup
    return () => {
      authListener.unsubscribe(); // Corrected unsubscribe call
    };
  }, []);

  return (
    <LocationProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen bg-neutral-light">
            <Navbar />
            <main className="flex-grow">
                <Routes>
                <Route path="/" element={<MainLayout />} />
                  <Route path="/home-services" element={<HomeServices />} />
                <Route path="/home-services/babysitters" element={<Babysitters />} />
                <Route path="/dashboard" element={<DashboardComponent />} />
                <Route path="/home-services/cleaners" element={<Cleaners />} />
                <Route path="/search-results" element={<SearchResultsPage />} />
                <Route path="/business/:id" element={<BusinessPage />} />
                <Route path="/subcategory/:subcategoryId" element={<SubcategoryPage />} />
                <Route path="/category/:categoryId" element={<CategoryPage />} />
                <Route path="/add-service" element={<AddServicePage />} />
                {/* Added routes for sign in components */}
                <Route path="/business-sign-in" element={<BusinessSignIn />} />
                <Route path="/user-sign-in" element={<UserSignIn />} />
                </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </ErrorBoundary>
    </LocationProvider>
  );
}

export default App;
