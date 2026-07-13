import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryAPI, itemAPI } from '../services/api';

const ReportItem = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [type, setType] = useState('lost'); // lost, found
  const [location, setLocation] = useState('');
  const [dateReported, setDateReported] = useState(new Date().toISOString().split('T')[0]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryAPI.getCategories();
        setCategories(res.data);
        if (res.data.length > 0) {
          setCategoryId(res.data[0].category_id);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('category_id', categoryId);
    formData.append('type', type);
    formData.append('location', location);
    formData.append('date_reported', dateReported);
    if (image) {
      formData.append('image', image);
    }

    try {
      await itemAPI.createItem(formData);
      setSuccess('Item reported successfully! Redirecting...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="search-panel">
        <h2 className="auth-title" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
          📢 Report Lost or Found Item
        </h2>

        {error && <div className="alert alert-danger">⚠️ {error}</div>}
        {success && <div className="alert alert-success">✅ {success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Report Type</label>
            <div style={{ display: 'flex', gap: '2rem', padding: '0.5rem 0' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                <input
                  type="radio"
                  name="type"
                  value="lost"
                  checked={type === 'lost'}
                  onChange={() => setType('lost')}
                  style={{ width: '18px', height: '18px' }}
                />
                Lost Item
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                <input
                  type="radio"
                  name="type"
                  value="found"
                  checked={type === 'found'}
                  onChange={() => setType('found')}
                  style={{ width: '18px', height: '18px' }}
                />
                Found Item
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Item Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Water Bottle, Keys, ID Card"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description & Key Features</label>
            <textarea
              className="form-control"
              placeholder="Provide color, brand, distinct scratches, contents, or serial numbers if any."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-control"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              {categories.map((cat) => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Location (Where was it lost/found?)</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Library, Cafe, Block C, Room 204"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Date (When was it lost/found?)</label>
            <input
              type="date"
              className="form-control"
              value={dateReported}
              onChange={(e) => setDateReported(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Upload Image (Optional)</label>
            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <div style={{ marginTop: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.5rem', width: 'fit-content' }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ maxHeight: '180px', borderRadius: 'var(--radius-sm)', objectFit: 'contain' }}
                />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Submitting Report...' : 'Submit Report'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/dashboard')}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportItem;
