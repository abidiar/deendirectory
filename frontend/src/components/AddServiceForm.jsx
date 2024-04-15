import React, { useState } from 'react';
import axios from 'axios';

const AddServiceForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    website: '',
    hours: '',
    image: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData((prevFormData) => ({
      ...prevFormData,
      image: file,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSubmit = new FormData();
    const mandatoryFields = ['name', 'description', 'category'];

    for (const [key, value] of Object.entries(formData)) {
      if (value || mandatoryFields.includes(key)) {
        formDataToSubmit.append(key, value);
      } else {
        formDataToSubmit.append(key, ''); // Send an empty string for optional fields if they are empty
      }
    }

    try {
      const response = await axios.post('/api/services', formDataToSubmit, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response.data);
      // Reset form data
      setFormData({
        name: '',
        description: '',
        category: '',
        website: '',
        hours: '',
        image: null,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="name">Name</label>
      <input
        type="text"
        id="name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
      />

      <label htmlFor="description">Description</label>
      <textarea
        id="description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        required
      ></textarea>

      <label htmlFor="category">Category</label>
      <input
        type="text"
        id="category"
        name="category"
        value={formData.category}
        onChange={handleChange}
        required
      />

      <label htmlFor="website">Website</label>
      <input
        type="text"
        id="website"
        name="website"
        value={formData.website}
        onChange={handleChange}
      />

      <label htmlFor="hours">Hours</label>
      <input
        type="text"
        id="hours"
        name="hours"
        value={formData.hours}
        onChange={handleChange}
      />

      <label htmlFor="image">Image</label>
      <input
        type="file"
        id="image"
        name="image"
        accept="image/*"
        onChange={handleImageChange}
      />

      <button type="submit">Add Service</button>
    </form>
  );
};

export default AddServiceForm;
