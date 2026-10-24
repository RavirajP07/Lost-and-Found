import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { itemAPI, claimAPI } from '../services/api';

const StudentDashboard = ({ user }) => {
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const itemsRes = await itemAPI.getItems();
        setItems(itemsRes.data);

        const claimsRes = await claimAPI.getClaims();
        setClaims(claimsRes.data);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeItems = items.filter(item => item.item_status === 'active');
  const myItems = items.filter(item => item.reporter_user_id === user.id);

  if (loading) return <div style={{ textAlign: 'center' }}>Loading Dashboard...</div>;

  return (
    <div>
      <h2>Welcome, {user.username}!</h2>

      <div className="card" style={{ marginBottom: '20px' }}>
        <h3>My Claims Status</h3>
        {claims.length === 0 ? <p>No claims submitted.</p> : (
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {claims.map(claim => (
                <tr key={claim.claim_id}>
                  <td>
                    {claim.item_name ? (
                      <Link to={`/items/${claim.item_id}`}>{claim.item_name}</Link>
                    ) : (
                      <span style={{ color: 'gray', fontStyle: 'italic' }}>Item Deleted</span>
                    )}
                  </td>
                  <td>{claim.claim_status}</td>
                  <td>{claim.admin_remarks || 'None'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <h3>My Reported Items</h3>
        {myItems.length === 0 ? <p>You haven't reported any items.</p> : (
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {myItems.map(item => (
                <tr key={item.item_id}>
                  <td><Link to={`/items/${item.item_id}`}>{item.item_name}</Link></td>
                  <td>{item.item_status}</td>
                  <td>{new Date(item.date_reported).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>All Active Items</h3>
          <Link to="/report"><button>Report New Item</button></Link>
        </div>
        
        {activeItems.length === 0 ? <p>No active items.</p> : (
          <div className="grid">
            {activeItems.map(item => (
              <div key={item.item_id} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
                <h4>{item.item_name} ({item.type})</h4>
                <p>Location: {item.location}</p>
                <Link to={`/items/${item.item_id}`}><button style={{ width: '100%' }}>View Details</button></Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
