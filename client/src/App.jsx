import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { supabase } from './services/supabaseClient'; // Ensure this path matches your Supabase client initialization
import { LocationProvider } from './context/LocationContext'; 
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SignOutPopup from './components/SignOutPopup';

// Lazy loading components
const MainLayout = lazy(() => import('./components/MainLayout'));
const BusinessSignIn = lazy(() => import('./components/BusinessSignIn'));
const UserSignIn = lazy(() => import('./components/UserSignIn'));
const DashboardComponent = lazy(() => import('./components/DashboardComponent'));
const HomeServices = lazy(() => import('./components/HomeServices'));
const SearchResultsPage = lazy(() => import('./components/SearchResultsPage'));
const BusinessPage = lazy(() => import('./components/BusinessPage'));
const Babysitters = lazy(() => import('./components/Babysitters'));
const Cleaners = lazy(() => import('./components/Cleaners'));
const SubcategoryPage = lazy(() => import('./components/SubcategoryPage'));
const CategoryPage = lazy(() => import('./components/CategoryPage'));
const AddServicePage = lazy(() => import('./pages/AddServicePage'));

function App() {
  const [session, setSession] = useState(null);
  const [showSignOutPopup, setShowSignOutPopup] = useState(false);

  useEffect(() => {
    setSession(supabase.auth.session);
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });

    return () => authListener.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setShowSignOutPopup(true);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const closeSignOutPopup = () => {
    setShowSignOutPopup(false);
    // Redirect to the appropriate page after sign-out
    // For example, navigate('/');
  };

  return (
    <LocationProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen bg-neutral-light">
            <Navbar onSignOut={handleSignOut} />
            <main className="flex-grow">
              <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                  <Route path="/" element={<MainLayout />} />
                  <Route path="/business-sign-in" element={<BusinessSignIn />} />
                  <Route path="/user-sign-in" element={<UserSignIn />} />
                  <Route path="/dashboard" element={<DashboardComponent />} />
                  <Route path="/home-services" element={<HomeServices />} />
                  <Route path="/home-services/babysitters" element={<Babysitters />} />
                  <Route path="/home-services/cleaners" element={<Cleaners />} />
                  <Route path="/search-results" element={<SearchResultsPage />} />
                  <Route path="/business/:id" element={<BusinessPage />} />
                  <Route path="/subcategory/:subcategoryId" element={<SubcategoryPage />} />
                  <Route path="/category/:categoryId" element={<CategoryPage />} />
                  <Route path="/add-service" element={<AddServicePage />} />
                  {/* Add other routes as needed */}
                  </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
        {showSignOutPopup && <SignOutPopup onClose={closeSignOutPopup} />}
      </ErrorBoundary>
    </LocationProvider>
  );
}

export default App;
