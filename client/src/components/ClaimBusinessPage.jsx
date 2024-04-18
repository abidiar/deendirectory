// ClaimBusinessPage.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import ClaimBusinessForm from './ClaimBusinessForm';

const ClaimBusinessPage = () => {
  const { id } = useParams(); // Use useParams hook to get the businessId from the URL

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Claim Your Business</h1>
      <ClaimBusinessForm businessId={id} /> {/* Pass the businessId to the ClaimBusinessForm */}
    </div>
  );
};

export default ClaimBusinessPage;
