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

  if (loading) return <div style={{ textAlign: 'center' }}>Loading Profile...</div>;

  return (
    <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h2>👤 Student Profile</h2>

      {profile ? (
        <table style={{ width: '100%' }}>
          <tbody>
            <tr>
              <td style={{ fontWeight: 'bold' }}>Username</td>
              <td>{profile.username}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold' }}>Roll Number</td>
              <td>{profile.roll_number}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold' }}>Email Address</td>
              <td>{profile.email}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold' }}>Phone Number</td>
              <td>{profile.phone_number || 'N/A'}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold' }}>Date Joined</td>
              <td>{new Date(profile.created_at).toLocaleDateString()}</td>
            </tr>
          </tbody>
        </table>
      ) : (
        <p>Failed to load profile data.</p>
      )}
    </div>
  );
};

export default Profile;
