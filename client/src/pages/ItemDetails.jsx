import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { itemAPI, claimAPI, SERVER_URL } from '../services/api';

const ItemDetails = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [claimProof, setClaimProof] = useState('');
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      const res = await itemAPI.getItem(id);
      setItem(res.data);
    } catch (err) {
      console.error(err);
      setError('Item not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemDetails();
  }, [id]);

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    setClaimLoading(true);
    try {
      await claimAPI.submitClaim({
        item_id: id,
        description: claimProof,
      });
      setClaimSuccess('🎉 Claim submitted! The campus administrator will review your ownership proof.');
      setClaimProof('');
      setShowClaimForm(false);
      fetchItemDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit claim.');
    } finally {
      setClaimLoading(false);
    }
  };

  const handleDeleteItem = async () => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await itemAPI.deleteItem(id);
        navigate(user?.role === 'admin' ? '/admin' : '/dashboard');
      } catch (err) {
        setError('Failed to delete report.');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '3rem' }}>🌀</div>
        <h3 style={{ marginTop: '12px' }}>Loading item details...</h3>
      </div>
    );
  }

  if (error && !item) {
    return (
      <div className="card alert-error">
        ⚠️ {error}
        <button onClick={() => navigate(-1)} style={{ marginLeft: 'auto' }}>Go Back</button>
      </div>
    );
  }

  const isOwner = user && (user.role === 'admin' || item.reporter_user_id === user.id);
  const canClaim = user && user.role === 'student' && item.type === 'found' && item.item_status === 'active' && item.reporter_user_id !== user.id;

  const imageSrc = item.primary_image_path
    ? (item.primary_image_path.startsWith('http')
        ? item.primary_image_path
        : `${SERVER_URL}/${item.primary_image_path.replace(/^\//, '')}`)
    : null;

  return (
    <div>
      {error && <div className="alert-banner alert-error">⚠️ {error}</div>}
      {claimSuccess && <div className="alert-banner alert-success">{claimSuccess}</div>}

      <div className="card" style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        {/* Left Column: Image Card */}
        <div style={{ flex: '1 1 320px', maxWidth: '420px' }}>
          <div style={{
            border: 'var(--ink-border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-comic)',
            overflow: 'hidden',
            background: '#FEF08A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '280px'
          }}>
            {imageSrc ? (
              <img 
                src={imageSrc} 
                alt={item.item_name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '5rem', marginBottom: '8px' }}>📦</div>
                <span style={{ fontWeight: 800, color: '#71717A' }}>No photo attached</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Details & Claim Form */}
        <div style={{ flex: '2 1 340px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span className="badge" style={{
              background: item.type === 'lost' ? '#FF6B6B' : '#00E676',
              color: item.type === 'lost' ? 'white' : '#18181B'
            }}>
              {item.type === 'lost' ? '🔴 LOST ITEM' : '🟢 FOUND ITEM'}
            </span>
            <span className="badge badge-category">{item.category_name || 'General'}</span>
            <span className="badge badge-status">Status: {item.item_status}</span>
          </div>

          <h2 style={{ fontSize: '2.2rem', marginBottom: '16px' }}>{item.item_name}</h2>

          <div style={{
            background: '#FFFDF5',
            border: '2px solid #18181B',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div><strong>📍 Location:</strong> {item.location}</div>
            <div><strong>📅 Date Reported:</strong> {new Date(item.date_reported).toLocaleDateString()}</div>
            <div><strong>👤 Reported By:</strong> {item.reporter_username || 'Campus Student'}</div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ marginBottom: '6px' }}>📝 Description</h4>
            <p style={{ margin: 0, fontWeight: 600, color: '#3F3F46', lineHeight: 1.6 }}>
              {item.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {canClaim && !showClaimForm && (
              <button className="btn-success" onClick={() => setShowClaimForm(true)}>
                🙋‍♂️ This is Mine (Submit Claim)
              </button>
            )}
            {isOwner && (
              <button className="btn-danger" onClick={handleDeleteItem}>
                🗑️ Delete Report
              </button>
            )}
            <button onClick={() => navigate(-1)} style={{ background: '#F4F4F5' }}>
              ⬅️ Back
            </button>
          </div>

          {/* Pop-up Claim Form */}
          {showClaimForm && (
            <form onSubmit={handleClaimSubmit} style={{
              marginTop: '24px',
              padding: '20px',
              background: '#FFF3B0',
              border: 'var(--ink-border)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-comic)'
            }}>
              <h3 style={{ marginTop: 0 }}>🙋‍♂️ Submit Ownership Proof</h3>
              <p style={{ fontSize: '0.9rem', color: '#52525B', fontWeight: 600 }}>
                Please provide specific details only the true owner would know (e.g. wallpaper, serial number, scratches, contents).
              </p>
              <div className="form-group">
                <textarea
                  required
                  rows="4"
                  value={claimProof}
                  onChange={(e) => setClaimProof(e.target.value)}
                  placeholder="e.g. The phone has a Pikachu sticker on the back and the lockscreen is..."
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn-success" disabled={claimLoading}>
                  {claimLoading ? 'Submitting...' : 'Submit Claim Proof 🚀'}
                </button>
                <button type="button" onClick={() => setShowClaimForm(false)} style={{ background: '#FFFFFF' }}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;
