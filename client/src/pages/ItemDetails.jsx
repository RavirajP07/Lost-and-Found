import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { itemAPI, claimAPI, SERVER_URL } from '../services/api';
import { getItemImage } from '../services/imageHelper';

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
    setError('');
    setClaimSuccess('');
    try {
      await claimAPI.submitClaim({
        item_id: id,
        description: claimProof,
      });
      setClaimSuccess('🎉 Claim successfully submitted! The campus administrator will review your submission.');
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
        <h3 style={{ marginTop: '12px', fontFamily: 'Space Grotesk' }}>Loading item details...</h3>
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
  const isItemActive = item.item_status === 'active';
  const imageUrl = getItemImage(item, SERVER_URL);

  return (
    <div>
      {error && <div className="alert-banner alert-error">⚠️ {error}</div>}
      {claimSuccess && <div className="alert-banner alert-success">{claimSuccess}</div>}

      <div className="card" style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        {/* Left Column: Image Card */}
        <div style={{ flex: '1 1 340px', maxWidth: '440px' }}>
          <div style={{
            border: 'var(--ink-border)',
            borderRadius: '0px',
            boxShadow: 'var(--shadow-comic)',
            overflow: 'hidden',
            background: '#F4F4F5',
            height: '320px'
          }}>
            <img 
              src={imageUrl} 
              alt={item.item_name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
        </div>

        {/* Right Column: Details & Claim Form */}
        <div style={{ flex: '2 1 360px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap' }}>
            <span className="badge" style={{
              background: item.type === 'lost' ? 'var(--pop-coral)' : 'var(--pop-lime)',
              color: item.type === 'lost' ? 'white' : 'var(--ink-black)'
            }}>
              {item.type === 'lost' ? '🔴 LOST ITEM' : '🟢 FOUND ITEM'}
            </span>
            <span className="badge badge-category">{item.category_name || 'General'}</span>
            <span className="badge badge-status">STATUS: {item.item_status}</span>
          </div>

          <h2 style={{ fontSize: '2.4rem', marginBottom: '16px', letterSpacing: '-0.5px' }}>
            {item.item_name}
          </h2>

          <div style={{
            background: '#F8F9FA',
            border: '2px solid #000000',
            borderRadius: '0px',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div><strong>📍 CAMPUS LOCATION:</strong> {item.location}</div>
            <div><strong>📅 DATE REPORTED:</strong> {new Date(item.date_reported).toLocaleDateString()}</div>
            <div><strong>👤 REPORTER:</strong> {item.reporter_username || 'Campus Student'}</div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ marginBottom: '6px' }}>📝 ITEM DESCRIPTION</h4>
            <p style={{ margin: 0, fontWeight: 500, color: '#374151', lineHeight: 1.6 }}>
              {item.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {isItemActive && !showClaimForm && (
              <button 
                className="btn-success" 
                onClick={() => setShowClaimForm(true)}
                style={{ padding: '12px 24px', fontSize: '1rem' }}
              >
                {item.type === 'found' ? '🙋‍♂️ Claim Ownership (This is Mine)' : '🤝 I Found This Item (Submit Return Details)'}
              </button>
            )}

            {isOwner && (
              <button className="btn-danger" onClick={handleDeleteItem}>
                🗑️ Delete Report
              </button>
            )}

            <button onClick={() => navigate(-1)} style={{ background: '#FFFFFF' }}>
              ⬅️ Back
            </button>
          </div>

          {/* Claim Submission Form */}
          {showClaimForm && (
            <form onSubmit={handleClaimSubmit} style={{
              marginTop: '24px',
              padding: '20px',
              background: '#FFFDE5',
              border: 'var(--ink-border)',
              borderRadius: '0px',
              boxShadow: 'var(--shadow-comic)'
            }}>
              <h3 style={{ marginTop: 0 }}>
                {item.type === 'found' ? '🙋‍♂️ Submit Ownership Proof' : '🤝 Submit Found Item Information'}
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#4B5563', fontWeight: 600 }}>
                {item.type === 'found' 
                  ? 'Describe identifying characteristics only the genuine owner would know (e.g. scratches, wallpaper, serial number, bag contents).'
                  : 'Let the reporter know where and when you found it, and how they can collect it (e.g. security office, hostel room, canteen counter).'}
              </p>
              <div className="form-group">
                <textarea
                  required
                  rows="4"
                  value={claimProof}
                  onChange={(e) => setClaimProof(e.target.value)}
                  placeholder="Enter details here..."
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn-success" disabled={claimLoading}>
                  {claimLoading ? 'Submitting...' : 'Submit Claim Details 🚀'}
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
