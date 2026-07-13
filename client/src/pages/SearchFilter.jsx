import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoryAPI, itemAPI } from '../services/api';

const SearchFilter = () => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState(''); // '', lost, found
  const [statusFilter, setStatusFilter] = useState('active'); // default to active, but they can select all
  const [dateFilter, setDateFilter] = useState('');

  // Fetch categories initially
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryAPI.getCategories();
        setCategories(res.data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch items based on current search parameters
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    const params = {};
    if (searchTerm) params.name = searchTerm;
    if (categoryFilter) params.category_id = categoryFilter;
    if (locationFilter) params.location = locationFilter;
    if (typeFilter) params.type = typeFilter;
    if (statusFilter) params.status = statusFilter;
    if (dateFilter) params.date_reported = dateFilter;

    try {
      const res = await itemAPI.getItems(params);
      setItems(res.data);
    } catch (err) {
      console.error('Failed to search items:', err);
    } finally {
      setLoading(false);
    }
  };

  // Perform search on mount or when filter choices update
  useEffect(() => {
    handleSearch();
  }, [categoryFilter, typeFilter, statusFilter]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setLocationFilter('');
    setTypeFilter('');
    setStatusFilter('active');
    setDateFilter('');
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div>
      <h2 className="section-title">🔍 Search & Filter Items</h2>

      {/* Filters Panel */}
      <div className="search-panel">
        <form onSubmit={handleSearch} className="search-grid">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Search Item Name / Description</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Category</label>
            <select
              className="form-control"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Type</label>
            <select
              className="form-control"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Status</label>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="claimed">Claimed</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Location</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Science Block"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Date Reported</label>
            <input
              type="date"
              className="form-control"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', gridColumn: 'span 2' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              Apply Search
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleClearFilters}>
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Results Display */}
      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}><h3>Searching database...</h3></div>
      ) : items.length === 0 ? (
        <div className="search-panel" style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No items matched your search criteria. Try modifying your filters.</p>
        </div>
      ) : (
        <div className="items-list">
          {items.map(item => (
            <div key={item.item_id} className="item-card">
              <div className="item-card-img-wrapper">
                {item.primary_image_path ? (
                  <img
                    src={`/${item.primary_image_path}`}
                    alt={item.item_name}
                    className="item-card-img"
                  />
                ) : (
                  <div className="item-card-no-img">
                    <span style={{ fontSize: '2rem' }}>📦</span>
                    <span>No Image</span>
                  </div>
                )}
                <span className={`item-badge ${item.type}`}>
                  {item.type}
                </span>
              </div>
              <div className="item-card-content">
                <div>
                  <h3 className="item-card-title">{item.item_name}</h3>
                  <p className="item-card-desc">{item.description}</p>
                </div>
                <div className="item-card-meta">
                  <div className="item-card-meta-row">
                    <span>Category:</span>
                    <strong style={{ color: 'var(--primary-color)' }}>{item.category_name}</strong>
                  </div>
                  <div className="item-card-meta-row">
                    <span>Location:</span>
                    <span>{item.location}</span>
                  </div>
                  <div className="item-card-meta-row">
                    <span>Date:</span>
                    <span>{formatDate(item.date_reported)}</span>
                  </div>
                  <div className="item-card-meta-row" style={{ marginBottom: '1rem' }}>
                    <span>Status:</span>
                    <span className={`status-indicator ${item.item_status}`}>
                      {item.item_status}
                    </span>
                  </div>
                  <Link
                    to={`/items/${item.item_id}`}
                    className="btn btn-primary btn-block"
                    style={{ padding: '0.5rem' }}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
