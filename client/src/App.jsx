import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { supabase } from './services/supabaseClient';
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider

// Import your other components
import Navbar from './components/Navbar';
import MainLayout from './components/MainLayout';
import Footer from './components/Footer';
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
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    setSession(supabase.auth.session());
    setLoadingSession(false);
  
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  
    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthProvider> {/* Wrap your app with AuthProvider */}
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-neutral-light">
          <Navbar />
          <main className="flex-grow">
            {loadingSession ? (
              <div className="flex justify-center items-center h-full">
                <h2>Loading session...</h2>
              </div>
            ) : session ? (
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
              </Routes>
            ) : (
              <div className="flex justify-center items-center h-full">
                <h2>Please login to access the application.</h2>
              </div>
            )}
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
