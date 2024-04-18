import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { supabase } from './services/supabaseClient';
import { LocationProvider } from './context/LocationContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SignOutPopup from './components/SignOutPopup';
import ClaimOrAddBusiness from './components/ClaimOrAddBusiness';

// Lazy loading components
const MainLayout = lazy(() => import('./components/MainLayout'));
const BusinessSignIn = lazy(() => import('./components/BusinessSignIn'));
const BusinessSignUp = lazy(() => import('./components/BusinessSignUp'));
const UserSignIn = lazy(() => import('./components/UserSignIn'));
const UserSignUp = lazy(() => import('./components/UserSignUp'));
const DashboardComponent = lazy(() => import('./components/DashboardComponent'));
const UserDashboard = lazy(() => import('./components/UserDashboard'));
const HomeServices = lazy(() => import('./components/HomeServices'));
const SearchResultsPage = lazy(() => import('./components/SearchResultsPage'));
const BusinessPage = lazy(() => import('./components/BusinessPage'));
const Babysitters = lazy(() => import('./components/Babysitters'));
const Cleaners = lazy(() => import('./components/Cleaners'));
const SubcategoryPage = lazy(() => import('./components/SubcategoryPage'));
const CategoryPage = lazy(() => import('./components/CategoryPage'));
const AddServicePage = lazy(() => import('./pages/AddServicePage'));
const AddServiceForm = lazy(() => import('./components/AddServiceForm')); // New import

// New pages
const AboutUs = lazy(() => import('./pages/AboutUs'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const Support = lazy(() => import('./pages/Support'));
const TermsOfUse = lazy(() => import('./pages/TermsOfUse'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const License = lazy(() => import('./pages/License'));

function App() {
  const [session, setSession] = useState(null);
  const [showSignOutPopup, setShowSignOutPopup] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setShowSignOutPopup(true);
      // Navigate to the appropriate page after a short delay
      setTimeout(() => {
        window.location.href = '/'; // Example: Redirect to the home page
      }, 2000); // Adjust the delay as needed (in milliseconds)
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const closeSignOutPopup = () => {
    setShowSignOutPopup(false);
    // Redirect to the appropriate page after sign-out
    // For example, navigate('/');
  };

  const handleSearch = async (searchTerm, location) => {
    try {
      const params = new URLSearchParams();
      params.append('searchTerm', searchTerm);
      if (location) {
        params.append('latitude', location.latitude);
        params.append('longitude', location.longitude);
      }

      const response = await fetch(`/api/search?${params}`);

      if (response.ok) {
        const data = await response.json();
        // Handle the search results, e.g., update state or redirect to search results page
        console.log('Search results:', data);
      } else {
        console.error('Search request failed');
      }
    } catch (error) {
      console.error('Error during search:', error);
    }
  };

  return (
    <LocationProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen bg-neutral-light">
            <Navbar onSignOut={handleSignOut} onSearch={handleSearch} />
            <main className="flex-grow">
              <Suspense fallback={<div>Loading...</div>}>
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<MainLayout />} />
                  <Route path="/business-sign-in" element={<BusinessSignIn />} />
                  <Route path="/business-sign-up" element={<BusinessSignUp />} />
                  <Route path="/claim-or-add-business" element={<ClaimOrAddBusiness />} />
                  <Route path="/user-sign-in" element={<UserSignIn />} />
                  <Route path="/user-sign-up" element={<UserSignUp />} />
                  <Route path="/dashboard" element={<DashboardComponent />} />
                  <Route path="/UserDashboard" element={<UserDashboard />} />
                  <Route path="/home-services" element={<HomeServices />} />
                  <Route path="/home-services/babysitters" element={<Babysitters />} />
                  <Route path="/home-services/cleaners" element={<Cleaners />} />
                  <Route path="/search-results" element={<SearchResultsPage />} />
                  <Route path="/business/:id" element={<BusinessPage />} />
                  <Route path="/subcategory/:subcategoryId" element={<SubcategoryPage />} />
                  <Route path="/category/:categoryId" element={<CategoryPage />} />
                  <Route path="/add-service" element={<AddServicePage />} />
                  <Route path="/add-service-form" element={<AddServiceForm />} /> {/* New route */}

                  {/* New routes */}
                  <Route path="/about-us" element={<AboutUs />} />
                  <Route path="/contact-us" element={<ContactUs />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/terms-of-use" element={<TermsOfUse />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/license" element={<License />} />
                </Routes>
                </ErrorBoundary>
              </Suspense>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
        {showSignOutPopup && <SignOutPopup onClose={closeSignOutPopup} />}
    </LocationProvider>
  );
}

export default App;