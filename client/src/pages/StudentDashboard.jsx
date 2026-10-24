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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2 style={{ marginTop: '16px', fontFamily: 'Space Grotesk' }}>Loading your dashboard...</h2>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Hero Banner */}
      <div className="card" style={{ background: '#FFFDF5', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <span className="badge badge-category" style={{ marginBottom: '8px' }}>🎓 Anna University Campus Portal</span>
            <h2 style={{ fontSize: '2rem', margin: '4px 0', letterSpacing: '-0.5px' }}>
              Welcome, {user?.username || 'Student'}! 👋
            </h2>
            <p style={{ margin: 0, fontWeight: 600, color: '#4B5563' }}>
              What would you like to do today? Select your primary action below.
            </p>
          </div>
          <Link to="/profile">
            <button style={{ background: '#FFFFFF', padding: '8px 16px', fontSize: '0.9rem' }}>
              👤 View My Profile
            </button>
          </Link>
        </div>
      </div>

      {/* =====================================================================
          PSYCHOLOGY-DRIVEN INTENT FORK (Loss Aversion & Altruistic Action Hub)
          ===================================================================== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '18px',
        marginBottom: '28px'
      }}>
        {/* High-Urgency Action: I Lost Something (Red Alert Affordance) */}
        <Link to="/report?type=lost" style={{ textDecoration: 'none' }}>
          <div className="card" style={{
            background: 'var(--pop-coral)',
            color: 'white',
            padding: '22px',
            marginBottom: 0,
            cursor: 'pointer',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge" style={{ background: '#FFFFFF', color: '#000000' }}>URGENT ACTION</span>
                <span style={{ fontSize: '2rem' }}>🔴</span>
              </div>
              <h3 style={{ fontSize: '1.45rem', color: '#FFFFFF', margin: '12px 0 6px' }}>I Lost An Item</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#FFFDF5', fontWeight: 600, lineHeight: 1.5 }}>
                Missing keys, wallet, phone, or bag? File a lost report immediately so campus finders can notify you.
              </p>
            </div>
            <div style={{ marginTop: '18px' }}>
              <button style={{ width: '100%', background: '#FFFFFF', color: '#000000', padding: '12px', fontSize: '0.95rem' }}>
                Report Lost Item 📢
              </button>
            </div>
          </div>
        </Link>

        {/* Altruistic / Reward Action: I Found Something (Green Positive Affordance) */}
        <Link to="/report?type=found" style={{ textDecoration: 'none' }}>
          <div className="card" style={{
            background: 'var(--pop-lime)',
            color: 'var(--ink-black)',
            padding: '22px',
            marginBottom: 0,
            cursor: 'pointer',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge" style={{ background: '#000000', color: '#FFFFFF' }}>HELP A PEER</span>
                <span style={{ fontSize: '2rem' }}>🟢</span>
              </div>
              <h3 style={{ fontSize: '1.45rem', margin: '12px 0 6px' }}>I Found An Item</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#18181B', fontWeight: 600, lineHeight: 1.5 }}>
                Picked up an item on campus? Help return it safely to its rightful student owner.
              </p>
            </div>
            <div style={{ marginTop: '18px' }}>
              <button style={{ width: '100%', background: '#000000', color: '#FFFFFF', padding: '12px', fontSize: '0.95rem' }}>
                Report Found Item 🤝
              </button>
            </div>
          </div>
        </Link>

        {/* Exploratory Action: Search All Campus Items */}
        <Link to="/search" style={{ textDecoration: 'none' }}>
          <div className="card" style={{
            background: 'var(--pop-yellow)',
            color: 'var(--ink-black)',
            padding: '22px',
            marginBottom: 0,
            cursor: 'pointer',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge" style={{ background: '#000000', color: '#FFFFFF' }}>EXPLORE</span>
                <span style={{ fontSize: '2rem' }}>🔍</span>
              </div>
              <h3 style={{ fontSize: '1.45rem', margin: '12px 0 6px' }}>Search Campus Catalog</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#18181B', fontWeight: 600, lineHeight: 1.5 }}>
                Browse all {items.length} items currently logged across campus with smart keyword & category filters.
              </p>
            </div>
            <div style={{ marginTop: '18px' }}>
              <button style={{ width: '100%', background: 'var(--pop-blue)', color: '#FFFFFF', padding: '12px', fontSize: '0.95rem' }}>
                Search & Filter 🚀
              </button>
            </div>
          </div>
        </Link>
      </div>

      {/* 4 Sharp Stat Counters */}
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

        <div className="stat-box" style={{ background: '#FF5A5F', color: 'white' }}>
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

      {/* =====================================================================
          SELF-RELEVANCE BIAS: User's Own Claims & Reports First
          ===================================================================== */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <h3>🏷️ My Claims & Inquiries ({claims.length})</h3>
        {claims.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', background: '#F8F9FA', border: '2px dashed #000000' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📭</div>
            <p style={{ fontWeight: 800, margin: 0 }}>No active claims submitted yet.</p>
            <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>
              Found an item that belongs to you? Submit a claim with proof to recover it.
            </span>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <h3 style={{ margin: 0 }}>📝 Items Reported by Me ({myItems.length})</h3>
          <Link to="/report">
            <button style={{ background: '#FFDE59', padding: '6px 14px', fontSize: '0.85rem' }}>
              ➕ File New Report
            </button>
          </Link>
        </div>

        {myItems.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', background: '#F8F9FA', border: '2px dashed #000000' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎒</div>
            <p style={{ fontWeight: 800, margin: 0 }}>You haven't reported any items yet.</p>
            <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>
              Did you misplace something or discover an unattended bag? File a report above!
            </span>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Item Title</th>
                  <th>Category</th>
                  <th>Campus Location</th>
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

      {/* =====================================================================
          COMMUNITY FEED: Active Campus Catalog with Goal-Driven Buttons
          ===================================================================== */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ margin: 0 }}>🌟 Recent Campus Items ({activeItems.length})</h3>
            <span style={{ fontSize: '0.85rem', color: '#6B7280', fontWeight: 600 }}>Click any item to submit a claim or return details</span>
          </div>
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
                      <button 
                        style={{ 
                          width: '100%', 
                          background: item.type === 'found' ? 'var(--pop-lime)' : 'var(--pop-cyan)',
                          color: 'var(--ink-black)'
                        }}
                      >
                        {item.type === 'found' ? '🙋‍♂️ Claim This Item' : '🤝 I Found This Item'}
                      </button>
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
