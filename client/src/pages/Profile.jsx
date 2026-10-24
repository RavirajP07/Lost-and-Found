import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const Profile = ({ user }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileRes = await authAPI.getProfile();
        setProfile(profileRes.data);
      } catch (err) {
        console.error('Failed to load profile details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [user]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '3rem' }}>🌀</div>
        <h3 style={{ marginTop: '12px' }}>Loading student profile...</h3>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto' }}>
      <div className="card" style={{ background: '#5CE1E6', marginBottom: '20px', textAlign: 'center' }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: '#FFFFFF',
          border: 'var(--ink-border)',
          boxShadow: 'var(--shadow-comic-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          margin: '0 auto 12px'
        }}>
          👤
        </div>
        <h2 style={{ fontSize: '1.8rem', margin: '0 0 6px' }}>{profile?.username || user?.username}</h2>
        <span className="badge badge-status" style={{ fontSize: '0.85rem' }}>
          Role: {profile?.role || user?.role || 'Student'}
        </span>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>🎒 Student Credentials</h3>

        {profile ? (
          <div className="table-container">
            <table>
              <tbody>
                <tr>
                  <td style={{ background: '#FFF3B0', width: '40%' }}>Student Name</td>
                  <td><strong>{profile.username}</strong></td>
                </tr>
                <tr>
                  <td style={{ background: '#FFF3B0' }}>Roll Number</td>
                  <td><span className="badge badge-category">{profile.roll_number || 'N/A'}</span></td>
                </tr>
                <tr>
                  <td style={{ background: '#FFF3B0' }}>Email Address</td>
                  <td><code>{profile.email}</code></td>
                </tr>
                <tr>
                  <td style={{ background: '#FFF3B0' }}>Phone Number</td>
                  <td>{profile.phone_number || 'Not provided'}</td>
                </tr>
                <tr>
                  <td style={{ background: '#FFF3B0' }}>Member Since</td>
                  <td>📅 {new Date(profile.created_at).toLocaleDateString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#71717A' }}>Failed to retrieve student profile.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
