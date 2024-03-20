// src/pages/AddServicePage.js

import React from 'react';
import AddServiceForm from '../components/AddServiceForm'; // Adjust the path as necessary

function AddServicePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-heading font-bold text-primary-dark mb-4">Add Your Business or Service</h1>
      <AddServiceForm />
    </div>
  );
}

export default AddServicePage;
