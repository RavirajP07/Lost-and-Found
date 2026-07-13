import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { itemAPI, claimAPI } from '../services/api';

const StudentDashboard = ({ user }) => {
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedFilter, setFeedFilter] = useState('all'); // all, lost, found

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const itemsRes = await itemAPI.getItems();
        setItems(itemsRes.data);

        const claimsRes = await claimAPI.getClaims();
        setClaims(claimsRes.data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredItems = items.filter(item => {
    if (feedFilter === 'all') return item.item_status === 'active';
    return item.item_status === 'active' && item.type === feedFilter;
  });

  const myReportedItems = items.filter(item => item.reporter_user_id === user.id);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '4rem' }}><h2>Loading Dashboard...</h2></div>;
  }

  return (
    <div className="dashboard-grid">
      {/* Left side: Main Feed of Reported Items */}
      <div>
        <div className="section-title">
          <span>Active Campus Board</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className={`btn btn-secondary ${feedFilter === 'all' ? 'active' : ''}`}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              onClick={() => setFeedFilter('all')}
            >
              All Active
            </button>
            <button
              className={`btn btn-secondary ${feedFilter === 'lost' ? 'active' : ''}`}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              onClick={() => setFeedFilter('lost')}
            >
              Lost
            </button>
            <button
              className={`btn btn-secondary ${feedFilter === 'found' ? 'active' : ''}`}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              onClick={() => setFeedFilter('found')}
            >
              Found
            </button>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="search-panel" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>No active matching items found on the board.</p>
            <Link to="/report" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Report an Item
            </Link>
          </div>
        ) : (
          <div className="items-list">
            {filteredItems.map(item => (
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
                      <span>No Image Uploaded</span>
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
                    <Link
                      to={`/items/${item.item_id}`}
                      className="btn btn-primary btn-block"
                      style={{ marginTop: '1rem', padding: '0.5rem' }}
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

      {/* Right side: Student Status widgets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* My Reported Items */}
        <div className="search-panel" style={{ padding: '1.25rem' }}>
          <h3 className="claim-card-title" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            My Reported Items ({myReportedItems.length})
          </h3>
          {myReportedItems.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>You haven't reported any items yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {myReportedItems.slice(0, 5).map(item => (
                <div key={item.item_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <Link to={`/items/${item.item_id}`} style={{ fontWeight: 500, color: 'var(--primary-color)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                    {item.item_name}
                  </Link>
                  <span className={`status-indicator ${item.item_status}`}>
                    {item.item_status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Claim Requests */}
        <div className="search-panel" style={{ padding: '1.25rem' }}>
          <h3 className="claim-card-title" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            My Claim Status ({claims.length})
          </h3>
          {claims.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No claim requests submitted.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {claims.map(claim => (
                <div key={claim.claim_id} className="claim-card" style={{ padding: '0.75rem', boxShadow: 'none', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <Link to={`/items/${claim.item_id}`} style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--primary-color)' }}>
                      {claim.item_name}
                    </Link>
                    <span className={`claim-card-status ${claim.claim_status}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                      {claim.claim_status}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}><strong>Proof: </strong>{claim.claim_proof}</p>
                  {claim.admin_remarks && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--warning-color)', marginTop: '0.25rem' }}>
                      <strong>Remarks: </strong>{claim.admin_remarks}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
