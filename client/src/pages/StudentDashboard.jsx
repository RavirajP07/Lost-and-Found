import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { itemAPI, claimAPI, SERVER_URL } from '../services/api';
import { getItemImage } from '../services/imageHelper';

const StudentDashboard = ({ user }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const itemsRes = await itemAPI.getItems();
        setItems(itemsRes.data || []);

        const claimsRes = await claimAPI.getClaims();
        setClaims(claimsRes.data || []);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeItems = (items || []).filter(item => item.item_status === 'active');
  const myItems = (items || []).filter(item => item.reporter_user_id === user?.id);
  const lostCount = (items || []).filter(item => item.type === 'lost').length;
  const foundCount = (items || []).filter(item => item.type === 'found').length;

  const getCategoryEmoji = (catName = '') => {
    const lower = catName.toLowerCase();
    if (lower.includes('elect')) return '💻';
    if (lower.includes('bag') || lower.includes('wallet')) return '🎒';
    if (lower.includes('key') || lower.includes('id')) return '🔑';
    if (lower.includes('book')) return '📚';
    if (lower.includes('cloth')) return '👕';
    return '📦';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '3rem', animation: 'spin 1s infinite linear' }}>🌀</div>
        <h2 style={{ marginTop: '16px' }}>Loading the Cartoon Portal...</h2>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Hero Banner */}
      <div className="card" style={{ background: '#FFF3B0', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge badge-category" style={{ marginBottom: '8px' }}>🎓 Campus Hub</span>
            <h2 style={{ fontSize: '2rem', margin: '6px 0' }}>Hey {user?.username || 'Student'}! 👋</h2>
            <p style={{ margin: 0, fontWeight: 700, color: '#52525B' }}>
              Track your reported items, check claim progress, and browse items found across campus.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/report">
              <button className="btn-success">➕ Report Lost / Found</button>
            </Link>
            <Link to="/search">
              <button className="btn-primary">🔍 Search Catalog</button>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Cartoon Stat Boxes */}
      <div className="stats-grid">
        <div className="stat-box" style={{ background: '#FFDE59' }}>
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <div className="stat-number">{items.length}</div>
            <div className="stat-label">Total Items</div>
          </div>
        </div>

        <div className="stat-box" style={{ background: '#00E676' }}>
          <div className="stat-icon">🟢</div>
          <div className="stat-info">
            <div className="stat-number">{foundCount}</div>
            <div className="stat-label">Found Items</div>
          </div>
        </div>

        <div className="stat-box" style={{ background: '#FF6B6B', color: 'white' }}>
          <div className="stat-icon">🔴</div>
          <div className="stat-info">
            <div className="stat-number" style={{ color: 'white' }}>{lostCount}</div>
            <div className="stat-label" style={{ color: '#fffdf0' }}>Lost Items</div>
          </div>
        </div>

        <div className="stat-box" style={{ background: '#5CE1E6' }}>
          <div className="stat-icon">🏷️</div>
          <div className="stat-info">
            <div className="stat-number">{claims.length}</div>
            <div className="stat-label">My Claims</div>
          </div>
        </div>
      </div>

      {/* My Claims Status Card */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <h3>🏷️ My Claims & Inquiries</h3>
        {claims.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', background: '#FFFDF5', border: '2px dashed #18181b', borderRadius: '12px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📭</div>
            <p style={{ fontWeight: 800, margin: 0 }}>No claims submitted yet.</p>
            <span style={{ fontSize: '0.85rem', color: '#71717A' }}>Found an item that belongs to you? Submit a claim with proof to recover it!</span>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Claim Status</th>
                  <th>Admin Remarks</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {claims.map(claim => (
                  <tr key={claim.claim_id}>
                    <td>
                      <strong>
                        {claim.item_name ? (
                          <Link to={`/items/${claim.item_id}`} style={{ textDecoration: 'underline' }}>
                            {claim.item_name}
                          </Link>
                        ) : (
                          <span style={{ color: 'gray', fontStyle: 'italic' }}>Item Archived</span>
                        )}
                      </strong>
                    </td>
                    <td>
                      <span className={`badge ${
                        claim.claim_status === 'approved' ? 'badge-found' : 
                        claim.claim_status === 'rejected' ? 'badge-lost' : 'badge-status'
                      }`}>
                        {claim.claim_status}
                      </span>
                    </td>
                    <td>{claim.admin_remarks || 'Pending administrative review'}</td>
                    <td>
                      {claim.item_id && (
                        <Link to={`/items/${claim.item_id}`}>
                          <button style={{ padding: '6px 12px', fontSize: '0.85rem' }}>View Item</button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* My Reported Items Card */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <h3>📝 Items Reported by Me ({myItems.length})</h3>
        {myItems.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', background: '#FFFDF5', border: '2px dashed #18181b', borderRadius: '12px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎒</div>
            <p style={{ fontWeight: 800, margin: 0 }}>You haven't reported any items.</p>
            <span style={{ fontSize: '0.85rem', color: '#71717A' }}>Lost something or found someone's keys? Report it now!</span>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {myItems.map(item => (
                  <tr key={item.item_id}>
                    <td>
                      <span className={`badge ${item.type === 'lost' ? 'badge-lost' : 'badge-found'}`}>
                        {item.type}
                      </span>
                    </td>
                    <td><strong>{item.item_name}</strong></td>
                    <td><span className="badge badge-category">{item.category_name || 'General'}</span></td>
                    <td>📍 {item.location}</td>
                    <td>📅 {new Date(item.date_reported).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/items/${item.item_id}`}>
                        <button style={{ padding: '6px 12px', fontSize: '0.85rem' }}>View 🔍</button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Active Campus Items Grid */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <h3>🌟 Active Campus Items ({activeItems.length})</h3>
          <Link to="/search">
            <button style={{ background: '#5CE1E6', padding: '8px 16px', fontSize: '0.9rem' }}>
              View All in Search 🚀
            </button>
          </Link>
        </div>

        {activeItems.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '20px', fontWeight: 700 }}>No active items listed right now.</p>
        ) : (
          <div className="item-grid">
            {activeItems.slice(0, 6).map(item => {
              const imageUrl = getItemImage(item, SERVER_URL);

              return (
                <div key={item.item_id} className="item-card">
                  <div className="item-image-wrapper">
                    <span className="item-badge-corner badge" style={{
                      background: item.type === 'lost' ? 'var(--pop-coral)' : 'var(--pop-lime)',
                      color: item.type === 'lost' ? 'white' : 'var(--ink-black)'
                    }}>
                      {item.type === 'lost' ? '🔴 LOST' : '🟢 FOUND'}
                    </span>
                    <img src={imageUrl} alt={item.item_name} />
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
    </div>
  );
};

export default StudentDashboard;
