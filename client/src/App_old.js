import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import FeaturedCategories from './components/FeaturedCategories';
import PopularServices from './components/PopularServices';
import Footer from './components/Footer';

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      <main className="flex-grow">
        <SearchBar />
        <FeaturedCategories />
        <PopularServices />
      </main>
      <Footer />
    </div>
  );
}

export default App;
