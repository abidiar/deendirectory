import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { supabase } from './services/supabaseClient';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Lazy load components
const MainLayout = lazy(() => import('./components/MainLayout'));
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
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      const session = await supabase.auth.session();
      setSession(session);
      setLoadingSession(false);
    };

    initSession();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen bg-neutral-light">
            <Navbar />
            <main className="flex-grow">
              <Suspense fallback={<div>Loading...</div>}>
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
              </Suspense>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
