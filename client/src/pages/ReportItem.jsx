import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryAPI, itemAPI } from '../services/api';

const ReportItem = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  
  const [type, setType] = useState('lost');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [location, setLocation] = useState('');
  const [dateReported, setDateReported] = useState('');
  const [image, setImage] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryAPI.getCategories();
        setCategories(res.data);
        if (res.data.length > 0) setCategoryId(res.data[0].category_id);
      } catch (err) { console.error(err); }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('type', type);
    formData.append('name', name);
    formData.append('description', description);
    formData.append('category_id', categoryId);
    formData.append('location', location);
    formData.append('date_reported', dateReported);
    if (image) formData.append('image', image);

    try {
      await itemAPI.createItem(formData);
      alert('Report submitted successfully!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Report an Item</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Report Type</label>
          <select value={type} onChange={e => setType(e.target.value)} required>
            <option value="lost">Lost Item</option>
            <option value="found">Found Item</option>
          </select>
        </div>

        <div className="form-group">
          <label>Item Name</label>
          <input type="text" required value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea required rows="4" value={description} onChange={e => setDescription(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
            {categories.map(cat => <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Location</label>
          <input type="text" required value={location} onChange={e => setLocation(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Date</label>
          <input type="date" required value={dateReported} onChange={e => setDateReported(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Image (Optional)</label>
          <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/dashboard')}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default ReportItem;
