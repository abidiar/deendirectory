import React, { useState } from 'react';

const AddServiceForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    website: '',
    hours: '',
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSubmit = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== '') {
        formDataToSubmit.append(key, value);
      }
    });

    if (image) {
      formDataToSubmit.append('image', image);
    }

    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        body: formDataToSubmit,
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error);
      } else {
        // Reset form data and image state
        setFormData({
          title: '',
          description: '',
          category: '',
          website: '',
          hours: '',
        });
        setImage(null);
        setError('');
      }
    } catch (error) {
      setError('An error occurred while submitting the form');
    }
  };

  return (
    <div>
      <h2>Add Service</h2>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          ></textarea>
        </div>
        <div>
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="">Select a category</option>
            <option value="category1">Category 1</option>
            <option value="category2">Category 2</option>
            <option value="category3">Category 3</option>
          </select>
        </div>
        <div>
          <label htmlFor="website">Website</label>
          <input
            type="text"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="hours">Hours</label>
          <input
            type="text"
            id="hours"
            name="hours"
            value={formData.hours}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="image">Image</label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default AddServiceForm;
