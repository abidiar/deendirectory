// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import MainLayout from './components/MainLayout'; // Includes NewNearYou
import Footer from './components/Footer';
import HomeServices from './components/HomeServices';
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
            <Route path="/business/:id" element={<BusinessPage />} />
            {/* Other routes */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
