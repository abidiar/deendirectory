import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom'; // Corrected import
import { supabase } from './services/supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from "@supabase/auth-ui-shared";

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
// You can remove UserSignIn and BusinessSignIn imports if you are using Supabase Auth UI instead.

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    setSession(supabase.auth.session());

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-neutral-light">
      <Navbar />
      <main className="flex-grow">
        {session ? (
          <Routes>
            {/* Your routes for authenticated users */}
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
            {/* Add other authenticated routes as needed */}
          </Routes>
        ) : (
          <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
