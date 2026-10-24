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
  const [dateReported, setDateReported] = useState(new Date().toISOString().split('T')[0]);
  const [image, setImage] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryAPI.getCategories();
        setCategories(res.data || []);
        if (res.data?.length > 0) {
          setCategoryId(res.data[0].category_id || res.data[0]._id);
        }
      } catch (err) {
        console.error(err);
      }
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
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div className="card" style={{ background: '#FFDE59', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.8rem', margin: 0 }}>📝 Report an Item</h2>
        <p style={{ margin: '6px 0 0', fontWeight: 700, color: '#18181B' }}>
          Lost your item or found something on campus? Fill out the details below!
        </p>
      </div>

      <div className="card">
        {error && <div className="alert-banner alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Item Type Selector Card */}
          <div className="form-group">
            <label>Item Type</label>
            <div style={{ display: 'flex', gap: '14px' }}>
              <div
                onClick={() => setType('lost')}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'var(--ink-border)',
                  background: type === 'lost' ? '#FF6B6B' : '#FFFFFF',
                  color: type === 'lost' ? '#FFFFFF' : '#18181B',
                  boxShadow: type === 'lost' ? '4px 4px 0px #18181b' : '2px 2px 0px #18181b',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontWeight: 800,
                  transition: 'all 0.15s ease'
                }}
              >
                🔴 I Lost An Item
              </div>
              <div
                onClick={() => setType('found')}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'var(--ink-border)',
                  background: type === 'found' ? '#00E676' : '#FFFFFF',
                  color: '#18181B',
                  boxShadow: type === 'found' ? '4px 4px 0px #18181b' : '2px 2px 0px #18181b',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontWeight: 800,
                  transition: 'all 0.15s ease'
                }}
              >
                🟢 I Found An Item
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Item Name / Short Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Blue Dell Laptop Charger, Silver Casio Watch..."
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              required
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
            >
              {categories.map(c => (
                <option key={c.category_id || c._id} value={c.category_id || c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Campus Location</label>
            <input
              type="text"
              required
              placeholder="e.g. Central Library Floor 2, Canteen Table 4..."
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Date Lost / Found</label>
            <input
              type="date"
              required
              value={dateReported}
              onChange={e => setDateReported(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Detailed Description</label>
            <textarea
              required
              rows="4"
              placeholder="Describe color, brand, condition, identifying marks, serial numbers, stickers..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Photo Attachment (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setImage(e.target.files[0])}
              style={{ background: '#FFFDF5', padding: '10px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button type="submit" className="btn-success" disabled={loading} style={{ flex: 1, padding: '14px' }}>
              {loading ? 'Submitting...' : '🚀 Submit Report'}
            </button>
            <button type="button" onClick={() => navigate(-1)} style={{ background: '#F4F4F5' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportItem;
