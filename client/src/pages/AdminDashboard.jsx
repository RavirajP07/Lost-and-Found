import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { claimAPI, itemAPI } from '../services/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('claims');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data states
  const [claims, setClaims] = useState([]);
  const [items, setItems] = useState([]);

  // Remarks states for claim actions
  const [selectedClaimId, setSelectedClaimId] = useState(null);
  const [claimStatusAction, setClaimStatusAction] = useState('');
  const [adminRemarks, setAdminRemarks] = useState('');
  const [showRemarksModal, setShowRemarksModal] = useState(false);

  const fetchClaims = async () => {
    try {
      const res = await claimAPI.getClaims();
      setClaims(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchItems = async () => {
    try {
      const res = await itemAPI.getItems();
      setItems(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    setError('');
    setSuccess('');
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
      setSuccess(`Claim successfully ${claimStatusAction}!`);
      setShowRemarksModal(false);
      fetchClaims();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process claim.');
    }
  };

  const handleDeletePost = async (id) => {
    if (window.confirm('Remove this post?')) {
      try {
        await itemAPI.deleteItem(id);
        setSuccess('Post removed.');
        fetchItems();
      } catch (err) {
        setError('Failed to delete post.');
      }
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('claims')} className={activeTab === 'claims' ? 'btn-primary' : 'btn-secondary'}>
          Claims Review
        </button>
        <button onClick={() => setActiveTab('moderation')} className={activeTab === 'moderation' ? 'btn-primary' : 'btn-secondary'}>
          Moderate Posts
        </button>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '10px' }}>⚠️ {error}</div>}
      {success && <div style={{ color: 'green', marginBottom: '10px' }}>✅ {success}</div>}

      {activeTab === 'claims' && (
        <div>
          <h3>Claims Queue</h3>
          {claims.length === 0 ? (
            <p>No claims found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Claimant</th>
                  <th>Item ID</th>
                  <th>Proof</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {claims.map(claim => (
                  <tr key={claim.claim_id}>
                    <td>{claim.claimant_username}</td>
                    <td><Link to={`/items/${claim.item_id}`}>{claim.item_name}</Link></td>
                    <td>{claim.claim_proof}</td>
                    <td>{claim.claim_status}</td>
                    <td>
                      {claim.claim_status === 'pending' && (
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button onClick={() => openRemarksModal(claim.claim_id, 'approved')}>Approve</button>
                          <button className="danger" onClick={() => openRemarksModal(claim.claim_id, 'rejected')}>Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'moderation' && (
        <div>
          <h3>Manage Postings</h3>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Location</th>
                <th>Reporter</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.item_id}>
                  <td>{item.item_name} ({item.type})</td>
                  <td>{item.location}</td>
                  <td>{item.reporter_username || 'Anonymous'}</td>
                  <td>
                    <button className="danger" onClick={() => handleDeletePost(item.item_id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showRemarksModal && (
        <div style={{ padding: '20px', border: '1px solid #ccc', background: '#f9f9f9', marginTop: '20px' }}>
          <h4>Process Claim</h4>
          <form onSubmit={handleProcessClaim}>
            <div className="form-group">
              <label>Remarks</label>
              <textarea
                value={adminRemarks}
                onChange={(e) => setAdminRemarks(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit">Submit</button>
              <button type="button" className="danger" onClick={() => setShowRemarksModal(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
