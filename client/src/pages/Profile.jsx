import React, { useState, useEffect } from 'react';
import { authAPI, itemAPI } from '../services/api';

const Profile = ({ user }) => {
  const [profile, setProfile] = useState(null);
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const profileRes = await authAPI.getProfile();
        setProfile(profileRes.data);

        const itemsRes = await itemAPI.getItems();
        const userItems = itemsRes.data.filter(item => item.reporter_user_id === user.id);
        setMyItems(userItems);
      } catch (err) {
        console.error('Failed to load profile details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [user]);

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '4rem' }}><h2>Loading Profile...</h2></div>;
  }

  const lostCount = myItems.filter(i => i.type === 'lost').length;
  const foundCount = myItems.filter(i => i.type === 'found').length;
  const resolvedCount = myItems.filter(i => i.item_status === 'resolved' || i.item_status === 'claimed').length;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 className="section-title">👤 Student Profile Manager</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Profile Card details */}
        <div className="search-panel" style={{ padding: '2rem' }}>
          <h3 className="claim-card-title" style={{ marginBottom: '1.5rem', fontSize: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Account Details
          </h3>
          {profile && (
            <table className="details-meta-table">
              <tbody>
                <tr>
                  <td className="label">Username</td>
                  <td style={{ fontWeight: 600 }}>{profile.username}</td>
                </tr>
                <tr>
                  <td className="label">Roll Number</td>
                  <td>{profile.roll_number}</td>
                </tr>
                <tr>
                  <td className="label">Email Address</td>
                  <td>{profile.email}</td>
                </tr>
                <tr>
                  <td className="label">Phone Number</td>
                  <td>{profile.phone_number}</td>
                </tr>
                <tr>
                  <td className="label">Date Joined</td>
                  <td>{new Date(profile.created_at).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* User Stats Card */}
        <div className="search-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 className="claim-card-title" style={{ marginBottom: '1.5rem', fontSize: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              My Contributions Activity
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Lost Items Reported:</span>
                <span className="status-indicator active" style={{ fontSize: '1rem', fontWeight: 700, padding: '0.2rem 0.6rem' }}>
                  {lostCount}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Found Items Uploaded:</span>
                <span className="status-indicator resolved" style={{ fontSize: '1rem', fontWeight: 700, padding: '0.2rem 0.6rem', backgroundColor: '#d1fae5', color: '#065f46' }}>
                  {foundCount}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Total Items Resolved/Claimed:</span>
                <span className="status-indicator claimed" style={{ fontSize: '1rem', fontWeight: 700, padding: '0.2rem 0.6rem' }}>
                  {resolvedCount}
                </span>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            🎓 Thank you for keeping our college campus safe and connected!
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
