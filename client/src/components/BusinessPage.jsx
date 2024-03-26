import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet'; // Make sure to install react-helmet

function BusinessPage() {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://deendirectorybackend.onrender.com';

  useEffect(() => {
    setIsLoading(true);
    fetch(`${backendUrl}/api/services/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .then(data => {
        setBusiness(data);
        setIsLoading(false);
      })
      .catch(err => {
        setError(`Error: ${err.message}`);
        setIsLoading(false);
      });
  }, [id, backendUrl]);

  if (isLoading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600">{error}</div>;
  }

  if (!business) {
    return <div className="text-center">Business not found.</div>;
  }

  // Dynamic page metadata for SEO
  const pageTitle = `${business.name} - DeenDirectory`;
  const pageDescription = business.description;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        {/* Other SEO relevant meta tags */}
      </Helmet>

      <div className="container mx-auto p-4 sm:p-6">
        <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-6">
          {/* Business Image */}
          <div className="flex justify-center mb-4">
            <img
              src={business.image_url || '/path/to/placeholder-image.jpg'}
              alt={`Profile for ${business.name}`}
              className="rounded-lg h-40 w-40 sm:h-48 sm:w-48 object-cover"
            />
          </div>
          
          {/* Business Details */}
          <h1 className="text-2xl sm:text-4xl font-bold text-center text-primary-dark mb-4">{business.name}</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4">{business.description}</p>
          {/* ...other business details */}
          
          {/* Return Navigation */}
          <div className="text-center mt-4">
            <Link to="/" className="text-primary hover:underline">Back to directory</Link>
          </div>
        </div>
        
        {/* Optionally, add a map and reviews here */}
      </div>

      {/* JSON-LD structured data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "http://schema.org",
          "@type": "LocalBusiness",
          "name": business.name,
          "description": business.description,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": business.street_address,
            "addressLocality": business.city,
            "addressRegion": business.state,
            "postalCode": business.postal_code,
            "addressCountry": business.country
          },
          "telephone": business.phone_number,
          "image": business.image_url,
          "url": window.location.href,
          // Add any additional structured data here
        })}
      </script>
    </>
  );
}

export default BusinessPage;
