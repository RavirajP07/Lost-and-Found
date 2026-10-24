import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { claimAPI, itemAPI, adminAPI } from '../services/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('claims');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data states
  const [claims, setClaims] = useState([]);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);

  // Remarks states for claim actions
  const [selectedClaimId, setSelectedClaimId] = useState(null);
  const [claimStatusAction, setClaimStatusAction] = useState('');
  const [adminRemarks, setAdminRemarks] = useState('');
  const [showRemarksModal, setShowRemarksModal] = useState(false);

  const fetchClaims = async () => {
    try {
      const res = await claimAPI.getClaims();
      setClaims(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await itemAPI.getItems();
      setItems(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await adminAPI.getStats();
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setError('');
    setSuccess('');
    fetchStats();
    if (activeTab === 'claims') fetchClaims();
    else if (activeTab === 'moderation') fetchItems();
  }, [activeTab]);

  const openRemarksModal = (claimId, action) => {
    setSelectedClaimId(claimId);
    setClaimStatusAction(action);
    setAdminRemarks('');
    setShowRemarksModal(true);
  };

  const handleProcessClaim = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await claimAPI.processClaim(selectedClaimId, claimStatusAction, adminRemarks);
      setSuccess(`🎉 Claim successfully marked as ${claimStatusAction}!`);
      setShowRemarksModal(false);
      fetchClaims();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process claim.');
    }
  };

  const handleDeletePost = async (id) => {
    if (window.confirm('Are you sure you want to remove this item report?')) {
      try {
        await itemAPI.deleteItem(id);
        setSuccess('Post removed by administrator.');
        fetchItems();
      } catch (err) {
        setError('Failed to delete post.');
      }
    }
  };

  const pendingClaims = claims.filter(c => c.claim_status === 'pending');
  const approvedClaims = claims.filter(c => c.claim_status === 'approved');

  return (
    <div>
      {/* Admin Title Card */}
      <div className="card" style={{ background: '#FFDE59', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span className="badge badge-resolved" style={{ marginBottom: '6px' }}>👑 Administration Control</span>
            <h2 style={{ fontSize: '2rem', margin: '4px 0' }}>Campus Moderation Center ⚡</h2>
            <p style={{ margin: 0, fontWeight: 700, color: '#18181B' }}>
              Verify student ownership proof, approve claims, and moderate campus reports.
            </p>
          </div>
          <Link to="/report">
            <button className="btn-success">➕ Add Found Item</button>
          </Link>
        </div>
      </div>

      {/* Admin Quick Stat Boxes */}
      <div className="stats-grid">
        <div className="stat-box" style={{ background: '#FFF3B0' }}>
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <div className="stat-number">{stats?.pendingClaims ?? pendingClaims.length}</div>
            <div className="stat-label">Pending Claims</div>
          </div>
        </div>

        <div className="stat-box" style={{ background: '#00E676' }}>
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-number">{stats?.resolvedItems ?? approvedClaims.length}</div>
            <div className="stat-label">Resolved Items</div>
          </div>
        </div>

        <div className="stat-box" style={{ background: '#5CE1E6' }}>
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <div className="stat-number">{stats?.totalItems ?? items.length}</div>
            <div className="stat-label">Total Reports</div>
          </div>
        </div>

        <div className="stat-box" style={{ background: '#B388FF', color: 'white' }}>
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-number" style={{ color: 'white' }}>{stats?.totalUsers ?? '1'}</div>
            <div className="stat-label" style={{ color: '#F8F9FA' }}>Students</div>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button 
          onClick={() => setActiveTab('claims')} 
          style={{ 
            background: activeTab === 'claims' ? '#4361EE' : '#FFFFFF',
            color: activeTab === 'claims' ? '#FFFFFF' : '#18181B'
          }}
        >
          🏷️ Review Claims Queue ({claims.length})
        </button>
        <button 
          onClick={() => setActiveTab('moderation')} 
          style={{ 
            background: activeTab === 'moderation' ? '#4361EE' : '#FFFFFF',
            color: activeTab === 'moderation' ? '#FFFFFF' : '#18181B'
          }}
        >
          🛡️ Moderate All Posts ({items.length})
        </button>
      </div>

      {error && <div className="alert-banner alert-error">⚠️ {error}</div>}
      {success && <div className="alert-banner alert-success">{success}</div>}

      {/* TAB 1: Claims Review Queue */}
      {activeTab === 'claims' && (
        <div className="card">
          <h3>🏷️ Claims Review Queue</h3>
          {claims.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '30px', fontWeight: 700 }}>No claims currently in the queue.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Claimant</th>
                    <th>Item Claimed</th>
                    <th>Proof of Ownership</th>
                    <th>Status</th>
                    <th>Admin Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map(claim => (
                    <tr key={claim.claim_id}>
                      <td><strong>👤 {claim.claimant_username || 'Student'}</strong></td>
                      <td>
                        <strong>
                          <Link to={`/items/${claim.item_id}`} style={{ textDecoration: 'underline' }}>
                            {claim.item_name || 'View Item'}
                          </Link>
                        </strong>
                      </td>
                      <td style={{ maxWidth: '300px' }}>
                        <div style={{ background: '#FFFDF5', padding: '8px 12px', borderRadius: '8px', border: '1px solid #18181B', fontSize: '0.9rem' }}>
                          "{claim.claim_proof || 'No proof provided'}"
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          claim.claim_status === 'approved' ? 'badge-found' : 
                          claim.claim_status === 'rejected' ? 'badge-lost' : 'badge-status'
                        }`}>
                          {claim.claim_status}
                        </span>
                      </td>
                      <td>
                        {claim.claim_status === 'pending' ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              className="btn-success" 
                              onClick={() => openRemarksModal(claim.claim_id, 'approved')}
                              style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                            >
                              Approve ✅
                            </button>
                            <button 
                              className="btn-danger" 
                              onClick={() => openRemarksModal(claim.claim_id, 'rejected')}
                              style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                            >
                              Reject ❌
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: '#71717A', fontWeight: 700 }}>Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Moderate Items */}
      {activeTab === 'moderation' && (
        <div className="card">
          <h3>🛡️ Campus Posts Moderation</h3>
          {items.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '30px', fontWeight: 700 }}>No items to moderate.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Item Title</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
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
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Link to={`/items/${item.item_id}`}>
                            <button style={{ padding: '6px 12px', fontSize: '0.85rem' }}>View 🔍</button>
                          </Link>
                          <button 
                            className="btn-danger"
                            onClick={() => handleDeletePost(item.item_id)}
                            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                          >
                            Delete 🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal for Remarks */}
      {showRemarksModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', background: '#FFFDF5' }}>
            <h3 style={{ marginTop: 0 }}>
              {claimStatusAction === 'approved' ? '✅ Approve Ownership Claim' : '❌ Reject Claim'}
            </h3>
            <p style={{ color: '#52525B', fontSize: '0.9rem', fontWeight: 700 }}>
              Add a brief comment or instructions for the student (e.g. pickup location, security office hours).
            </p>
            <form onSubmit={handleProcessClaim}>
              <div className="form-group">
                <label>Admin Remarks</label>
                <textarea
                  rows="3"
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  placeholder="e.g. Verified. Please visit Security Room 102 with student ID to collect item."
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className={claimStatusAction === 'approved' ? 'btn-success' : 'btn-danger'}>
                  Confirm {claimStatusAction === 'approved' ? 'Approval' : 'Rejection'}
                </button>
                <button type="button" onClick={() => setShowRemarksModal(false)} style={{ background: '#FFFFFF' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
