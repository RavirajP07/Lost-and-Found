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
    try {
      await claimAPI.submitClaim({
        item_id: id,
        description: claimProof,
      });
      setClaimSuccess('Claim submitted successfully!');
      setClaimProof('');
      setShowClaimForm(false);
      fetchItemDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit claim.');
    }
  };

  const handleDeleteItem = async () => {
    if (window.confirm('Delete this report?')) {
      try {
        await itemAPI.deleteItem(id);
        navigate(user.role === 'admin' ? '/admin' : '/dashboard');
      } catch (err) {
        setError('Failed to delete.');
      }
    }
  };

  if (loading) return <div style={{ textAlign: 'center' }}>Loading...</div>;
  if (error && !item) return <div style={{ color: 'red' }}>{error}</div>;

  const isOwner = user && (user.role === 'admin' || item.reporter_user_id === user.id);
  const canClaim = user && user.role === 'student' && item.type === 'found' && item.item_status === 'active' && item.reporter_user_id !== user.id;

  return (
    <div className="card">
      {error && <div style={{ color: 'red' }}>⚠️ {error}</div>}
      {claimSuccess && <div style={{ color: 'green' }}>✅ {claimSuccess}</div>}

      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          {item.primary_image_path ? (
            <img 
              src={item.primary_image_path.startsWith('http') ? item.primary_image_path : `${SERVER_URL}/${item.primary_image_path.replace(/^\//, '')}`} 
              alt={item.item_name} 
              style={{ width: '100%', borderRadius: '8px' }} 
            />
          ) : (
            <div style={{ padding: '50px', background: '#eee', textAlign: 'center' }}>No image</div>
          )}
        </div>

        <div style={{ flex: 2 }}>
          <h2>{item.item_name} ({item.type})</h2>
          <p><strong>Status:</strong> {item.item_status}</p>
          <p><strong>Category:</strong> {item.category_name}</p>
          <p><strong>Location:</strong> {item.location}</p>
          <p><strong>Description:</strong> {item.description}</p>
          
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            {canClaim && !showClaimForm && (
              <button onClick={() => setShowClaimForm(true)}>🙋‍♂️ Claim Ownership</button>
            )}
            {isOwner && (
              <button className="danger" onClick={handleDeleteItem}>🗑️ Delete</button>
            )}
            <button className="btn-secondary" onClick={() => navigate(-1)}>Back</button>
          </div>

          {showClaimForm && (
            <form onSubmit={handleClaimSubmit} style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
              <h3>Submit Claim</h3>
              <div className="form-group">
                <label>Proof of Ownership</label>
                <textarea
                  required
                  rows="4"
                  value={claimProof}
                  onChange={(e) => setClaimProof(e.target.value)}
                  placeholder="Describe unique features..."
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit">Submit Claim</button>
                <button type="button" className="btn-secondary" onClick={() => setShowClaimForm(false)}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;
