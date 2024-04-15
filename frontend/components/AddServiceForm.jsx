import React, { useState } from 'react';

const AddServiceForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    postal_code: '',
    image_url: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Handle form submission
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="title">Title</label>
      <input
        type="text"
        id="title"
        name="title"
        value={formData.title}
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

      <label htmlFor="categoryId">Category</label>
      <select
        id="category"
        name="categoryId"
        value={formData.categoryId}
        onChange={handleChange}
        required
      >
        <option value="">Select a Category</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      <label htmlFor="location">Location</label>
      <input
        type="text"
        id="location"
        name="location"
        value={formData.location}
        onChange={handleChange}
        required
      />

      <label htmlFor="postal_code">Postal Code</label>
      <input
        type="text"
        id="postal_code"
        name="postal_code"
        value={formData.postal_code}
        onChange={handleChange}
        required
      />

      <label htmlFor="image_url">Image URL</label>
      <input
        type="text"
        id="image_url"
        name="image_url"
        value={formData.image_url}
        onChange={handleChange}
      />

      <button type="submit">Add Service</button>
    </form>
  );
};

export default AddServiceForm;
