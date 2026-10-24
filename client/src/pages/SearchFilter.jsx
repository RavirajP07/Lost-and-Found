import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { itemAPI } from '../services/api';

const SearchFilter = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Simplified Search filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState(''); // '', lost, found

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    const params = {};
    if (searchTerm) params.name = searchTerm;
    if (typeFilter) params.type = typeFilter;
    params.status = 'active';

    try {
      const res = await itemAPI.getItems(params);
      setItems(res.data);
    } catch (err) {
      console.error('Failed to search items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [typeFilter]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div>
      <h2>🔍 Search Items</h2>

      <div className="card">
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>Search Keyword</label>
            <input
              type="text"
              placeholder="Enter keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>Type</label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">All Types</option>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
          </div>

          <button type="submit">Search</button>
          <button type="button" className="btn-secondary" onClick={handleClearFilters}>Clear</button>
        </form>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>Loading...</div>
      ) : items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}>No items found.</div>
      ) : (
        <div className="grid">
          {items.map(item => (
            <div key={item.item_id} className="card">
              <h3>{item.item_name}</h3>
              <p>{item.description}</p>
              <p><strong>Type:</strong> {item.type}</p>
              <p><strong>Location:</strong> {item.location}</p>
              <p><strong>Date:</strong> {formatDate(item.date_reported)}</p>
              <Link to={`/items/${item.item_id}`}>
                <button style={{ width: '100%', marginTop: '10px' }}>View Details</button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
