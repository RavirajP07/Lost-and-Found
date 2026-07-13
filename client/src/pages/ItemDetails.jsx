import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { itemAPI, claimAPI } from '../services/api';

const ItemDetails = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claimProof, setClaimProof] = useState('');
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState('');
  const [claimError, setClaimError] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);

  // Edit / Delete states (for Owner / Admin)
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editStatus, setEditStatus] = useState('');

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      const res = await itemAPI.getItem(id);
      setItem(res.data);
      setEditName(res.data.item_name);
      setEditDesc(res.data.description);
      setEditLocation(res.data.location);
      setEditStatus(res.data.item_status);
    } catch (err) {
      console.error(err);
      setError('Item not found or failed to load details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemDetails();
  }, [id]);

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    setClaimError('');
    setClaimSuccess('');
    setClaimLoading(true);

    try {
      await claimAPI.submitClaim({
        item_id: id,
        description: claimProof,
      });
      setClaimSuccess('Claim submitted successfully! The admin will review it.');
      setClaimProof('');
      setTimeout(() => {
        setShowClaimModal(false);
        fetchItemDetails(); // Refresh item status if it changed
      }, 2000);
    } catch (err) {
      setClaimError(err.response?.data?.message || 'Failed to submit claim.');
    } finally {
      setClaimLoading(false);
    }
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await itemAPI.updateItem(id, {
        name: editName,
        description: editDesc,
        category_id: item.category_id,
        type: item.type,
        location: editLocation,
        date_reported: item.date_reported.split('T')[0],
        status: editStatus,
      });
      setIsEditing(false);
      fetchItemDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update item.');
    }
  };

  const handleDeleteItem = async () => {
    if (window.confirm('Are you sure you want to delete this report? This action is permanent.')) {
      try {
        await itemAPI.deleteItem(id);
        navigate(user.role === 'admin' ? '/admin' : '/dashboard');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete item.');
      }
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '4rem' }}><h2>Loading Item Details...</h2></div>;
  }

  if (error && !item) {
    return (
      <div className="alert alert-danger" style={{ maxWidth: '500px', margin: '4rem auto', textAlign: 'center' }}>
        ⚠️ {error}
        <br />
        <Link to="/dashboard" className="btn btn-secondary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const isOwner = user && (user.role === 'admin' || (user.role === 'student' && item.reporter_user_id === user.id));
  const showClaimBtn = user && user.role === 'student' && item.type === 'found' && item.item_status === 'active' && item.reporter_user_id !== user.id;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="details-container">
      {error && <div className="alert alert-danger">⚠️ {error}</div>}

      <div className="details-grid">
        {/* Left Side: Images */}
        <div className="details-img-panel">
          {item.primary_image_path ? (
            <img src={`/${item.primary_image_path}`} alt={item.item_name} className="details-img" />
          ) : (
            <div className="item-card-no-img" style={{ width: '100%', height: '100%', minHeight: '350px' }}>
              <span style={{ fontSize: '4rem' }}>📦</span>
              <span>No image uploaded for this item</span>
            </div>
          )}
        </div>

        {/* Right Side: Details / Edit Form */}
        <div className="details-content-panel">
          {isEditing ? (
            <form onSubmit={handleUpdateItem}>
              <h3 className="section-title">Edit Report</h3>

              <div className="form-group">
                <label className="form-label">Item Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className="form-control"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-control"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="claimed">Claimed</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Save Changes
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="details-header">
                <span className={`item-badge ${item.type}`} style={{ position: 'static', display: 'inline-block', marginBottom: '0.5rem' }}>
                  {item.type}
                </span>
                <h1 className="details-title">{item.item_name}</h1>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span>Status:</span>
                  <span className={`status-indicator ${item.item_status}`}>
                    {item.item_status}
                  </span>
                </div>
              </div>

              <div className="details-desc-box">
                <strong>Description:</strong>
                <p style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap', color: 'var(--text-main)' }}>{item.description}</p>
              </div>

              <table className="details-meta-table">
                <tbody>
                  <tr>
                    <td className="label">Category</td>
                    <td>{item.category_name}</td>
                  </tr>
                  <tr>
                    <td className="label">Location Found/Lost</td>
                    <td>{item.location}</td>
                  </tr>
                  <tr>
                    <td className="label">Date Reported</td>
                    <td>{formatDate(item.date_reported)}</td>
                  </tr>
                  <tr>
                    <td className="label">Reported By</td>
                    <td>
                      {item.reporter_username ? (
                        <>
                          <span>{item.reporter_username} (Student)</span>
                          <br />
                          <small style={{ color: 'var(--text-muted)' }}>{item.reporter_email}</small>
                        </>
                      ) : item.reporter_admin_username ? (
                        <span>{item.reporter_admin_username} (Admin)</span>
                      ) : (
                        <span>Unknown user</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {showClaimBtn && (
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setShowClaimModal(true)}>
                    🙋‍♂️ Claim Ownership
                  </button>
                )}

                {isOwner && (
                  <>
                    <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>
                      ✏️ Edit Report
                    </button>
                    <button className="btn btn-danger" onClick={handleDeleteItem}>
                      🗑️ Delete Report
                    </button>
                  </>
                )}

                <button
                  className="btn btn-secondary"
                  style={{ flex: isOwner || showClaimBtn ? '0 1 auto' : '1' }}
                  onClick={() => navigate(user && user.role === 'admin' ? '/admin' : '/dashboard')}
                >
                  Back
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Claim Dialog Modal */}
      {showClaimModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <span>Submit Ownership Claim</span>
              <button className="modal-close" onClick={() => setShowClaimModal(false)}>×</button>
            </div>

            {claimError && <div className="alert alert-danger">⚠️ {claimError}</div>}
            {claimSuccess && <div className="alert alert-success">✅ {claimSuccess}</div>}

            <form onSubmit={handleClaimSubmit}>
              <div className="form-group">
                <label className="form-label">Proof of Ownership / Description</label>
                <textarea
                  className="form-control"
                  placeholder="Explain in detail how this belongs to you. Mention unique identification details (e.g. keychains, wallpaper, stickers, scratches, contents inside, receipt/bill, or precise date/time lost)."
                  value={claimProof}
                  onChange={(e) => setClaimProof(e.target.value)}
                  rows="6"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={claimLoading}>
                  {claimLoading ? 'Submitting Claim...' : 'Submit Claim'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowClaimModal(false)}
                  disabled={claimLoading}
                >
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

export default ItemDetails;
