import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { itemAPI, categoryAPI, SERVER_URL } from '../services/api';

const SearchFilter = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState(''); // '', lost, found
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryAPI.getCategories();
        setCategories(res.data || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCats();
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    const params = {};
    if (searchTerm.trim()) params.name = searchTerm.trim();
    if (typeFilter) params.type = typeFilter;
    if (categoryFilter) params.category_id = categoryFilter;
    params.status = 'active';

    try {
      const res = await itemAPI.getItems(params);
      setItems(res.data || []);
    } catch (err) {
      console.error('Failed to search items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [typeFilter, categoryFilter]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
    setCategoryFilter('');
  };

  const getCategoryEmoji = (catName = '') => {
    const lower = catName.toLowerCase();
    if (lower.includes('elect')) return '💻';
    if (lower.includes('bag') || lower.includes('wallet')) return '🎒';
    if (lower.includes('key') || lower.includes('id')) return '🔑';
    if (lower.includes('book')) return '📚';
    if (lower.includes('cloth')) return '👕';
    return '📦';
  };

  return (
    <div>
      {/* Header Banner */}
      <div className="card" style={{ background: '#5CE1E6', marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.8rem', margin: 0 }}>🔍 Search Campus Items</h2>
        <p style={{ margin: '6px 0 0', fontWeight: 700, color: '#18181B' }}>
          Browse all active lost and found items. Filter by item type or category.
        </p>
      </div>

      {/* Comic Search & Filter Control Card */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <form onSubmit={handleSearch}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <div style={{ flex: '1 1 300px' }}>
              <label>Search Keyword</label>
              <input
                type="text"
                placeholder="e.g. AirPods, Blue Backpack, Room Key..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ flex: '1 1 180px' }}>
              <label>Category</label>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c.category_id || c._id} value={c.category_id || c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
              <button type="submit" className="btn-primary" style={{ height: '50px' }}>
                Search 🚀
              </button>
              <button 
                type="button" 
                onClick={handleClearFilters}
                style={{ height: '50px', background: '#F4F4F5' }}
              >
                Reset 🔄
              </button>
            </div>
          </div>

          {/* Quick Filter Pill Buttons */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#52525B' }}>Filter Type:</span>
            <button
              type="button"
              onClick={() => setTypeFilter('')}
              style={{
                padding: '6px 14px',
                fontSize: '0.85rem',
                background: typeFilter === '' ? '#FFDE59' : '#FFFFFF',
                boxShadow: typeFilter === '' ? '4px 4px 0px #18181b' : '2px 2px 0px #18181b'
              }}
            >
              All Items ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('lost')}
              style={{
                padding: '6px 14px',
                fontSize: '0.85rem',
                background: typeFilter === 'lost' ? '#FF6B6B' : '#FFFFFF',
                color: typeFilter === 'lost' ? 'white' : '#18181B',
                boxShadow: typeFilter === 'lost' ? '4px 4px 0px #18181b' : '2px 2px 0px #18181b'
              }}
            >
              🔴 Lost Only
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('found')}
              style={{
                padding: '6px 14px',
                fontSize: '0.85rem',
                background: typeFilter === 'found' ? '#00E676' : '#FFFFFF',
                boxShadow: typeFilter === 'found' ? '4px 4px 0px #18181b' : '2px 2px 0px #18181b'
              }}
            >
              🟢 Found Only
            </button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '3rem' }}>🌀</div>
          <h3 style={{ marginTop: '12px' }}>Hunting for items...</h3>
        </div>
      ) : items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px', background: '#FFFDF5' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🕵️‍♀️</div>
          <h3>No matching items found!</h3>
          <p style={{ color: '#71717A', fontWeight: 600 }}>
            Try tweaking your search keywords or resetting filters.
          </p>
          <button onClick={handleClearFilters} style={{ marginTop: '12px' }}>
            Show All Items 📦
          </button>
        </div>
      ) : (
        <div className="item-grid">
          {items.map(item => {
            const imageSrc = item.primary_image_path
              ? (item.primary_image_path.startsWith('http')
                  ? item.primary_image_path
                  : `${SERVER_URL}/${item.primary_image_path.replace(/^\//, '')}`)
              : null;

            return (
              <div key={item.item_id} className="item-card">
                <div className="item-image-wrapper">
                  <span className="item-badge-corner badge" style={{
                    background: item.type === 'lost' ? '#FF6B6B' : '#00E676',
                    color: item.type === 'lost' ? 'white' : '#18181B'
                  }}>
                    {item.type === 'lost' ? '🔴 LOST' : '🟢 FOUND'}
                  </span>

                  {imageSrc ? (
                    <img src={imageSrc} alt={item.item_name} />
                  ) : (
                    <div className="item-image-fallback">
                      {getCategoryEmoji(item.category_name)}
                    </div>
                  )}
                </div>

                <div className="item-content">
                  <div className="item-title">{item.item_name}</div>
                  <div className="item-meta">
                    <span>🏷️ {item.category_name || 'General'}</span>
                    <span>📍 {item.location}</span>
                    <span>📅 {new Date(item.date_reported).toLocaleDateString()}</span>
                  </div>
                  <p className="item-description">{item.description}</p>
                  <Link to={`/items/${item.item_id}`} style={{ marginTop: 'auto' }}>
                    <button style={{ width: '100%' }}>View & Claim 👀</button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
