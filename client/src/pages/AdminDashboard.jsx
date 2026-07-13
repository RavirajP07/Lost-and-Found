import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { claimAPI, categoryAPI, adminAPI, itemAPI } from '../services/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('claims'); // claims, categories, stats, logs, moderation, users
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data states
  const [claims, setClaims] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);

  // Form states for categories
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [editingCatId, setEditingCatId] = useState(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatDesc, setEditCatDesc] = useState('');

  // Remarks states for claim actions
  const [selectedClaimId, setSelectedClaimId] = useState(null);
  const [claimStatusAction, setClaimStatusAction] = useState(''); // approved, rejected
  const [adminRemarks, setAdminRemarks] = useState('');
  const [showRemarksModal, setShowRemarksModal] = useState(false);

  const fetchClaims = async () => {
    try {
      const res = await claimAPI.getClaims();
      setClaims(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchCategories = async () => {
    try {
      const res = await categoryAPI.getCategories();
      setCategories(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchStats = async () => {
    try {
      const res = await adminAPI.getStats();
      setStats(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchLogs = async () => {
    try {
      const res = await adminAPI.getLogs();
      setLogs(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchItems = async () => {
    try {
      const res = await itemAPI.getItems();
      setItems(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchUsers = async () => {
    try {
      const res = await adminAPI.getUsers();
      setUsers(res.data);
    } catch (err) { console.error(err); }
  };

  // Load correct data depending on active tab
  useEffect(() => {
    setError('');
    setSuccess('');
    if (activeTab === 'claims') fetchClaims();
    else if (activeTab === 'categories') fetchCategories();
    else if (activeTab === 'stats') fetchStats();
    else if (activeTab === 'logs') fetchLogs();
    else if (activeTab === 'moderation') fetchItems();
    else if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  // Claim actions
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

  // Category CRUD actions
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName) return;
    setError('');
    try {
      await categoryAPI.createCategory({ name: newCatName, description: newCatDesc });
      setSuccess('Category added successfully.');
      setNewCatName('');
      setNewCatDesc('');
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add category.');
    }
  };

  const handleStartEditCategory = (cat) => {
    setEditingCatId(cat.category_id);
    setEditCatName(cat.name);
    setEditCatDesc(cat.description || '');
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await categoryAPI.updateCategory(editingCatId, { name: editCatName, description: editCatDesc });
      setSuccess('Category updated.');
      setEditingCatId(null);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update category.');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Delete category? Items in this category will also be deleted.')) {
      try {
        await categoryAPI.deleteCategory(id);
        setSuccess('Category deleted.');
        fetchCategories();
      } catch (err) {
        setError('Failed to delete category.');
      }
    }
  };

  // Post moderation
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

  // User management
  const handleDeleteUser = async (id) => {
    if (window.confirm('Delete student account? All reported items by them will remain, attributed to anonymous.')) {
      try {
        await adminAPI.deleteUser(id);
        setSuccess('Student account removed.');
        fetchUsers();
      } catch (err) {
        setError('Failed to delete user.');
      }
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div>
      <h2 className="section-title">🛡️ Admin Dashboard</h2>

      {/* Admin tabs */}
      <div className="admin-tab-bar">
        <button className={`admin-tab ${activeTab === 'claims' ? 'active' : ''}`} onClick={() => setActiveTab('claims')}>
          Claims Review
        </button>
        <button className={`admin-tab ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>
          Categories
        </button>
        <button className={`admin-tab ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>
          Analytics Stats
        </button>
        <button className={`admin-tab ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
          Activity Logs
        </button>
        <button className={`admin-tab ${activeTab === 'moderation' ? 'active' : ''}`} onClick={() => setActiveTab('moderation')}>
          Moderate Posts
        </button>
        <button className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          Manage Users
        </button>
      </div>

      {error && <div className="alert alert-danger">⚠️ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      {/* 1. CLAIMS TAB */}
      {activeTab === 'claims' && (
        <div>
          <h3 className="claim-card-title" style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Claims Queue</h3>
          {claims.length === 0 ? (
            <p>No claims logged in the database.</p>
          ) : (
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Claimant</th>
                    <th>Item Claimed</th>
                    <th>Proof Provided</th>
                    <th>Date Claimed</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map(claim => (
                    <tr key={claim.claim_id}>
                      <td>
                        <strong>{claim.claimant_username}</strong>
                        <br />
                        <small style={{ color: 'var(--text-muted)' }}>{claim.claimant_email}</small>
                      </td>
                      <td>
                        <Link to={`/items/${claim.item_id}`} style={{ color: 'var(--primary-color)', fontWeight: 600 }}>
                          {claim.item_name}
                        </Link>
                        <br />
                        <span className={`status-indicator ${claim.item_status}`}>{claim.item_status}</span>
                      </td>
                      <td>{claim.claim_proof}</td>
                      <td>{formatDate(claim.claimed_at)}</td>
                      <td>
                        <span className={`claim-card-status ${claim.claim_status}`}>{claim.claim_status}</span>
                      </td>
                      <td>
                        {claim.claim_status === 'pending' ? (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => openRemarksModal(claim.claim_id, 'approved')}>
                              Approve
                            </button>
                            <button className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => openRemarksModal(claim.claim_id, 'rejected')}>
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reviewed</span>
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

      {/* 2. CATEGORIES TAB */}
      {activeTab === 'categories' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          <div>
            <h4 style={{ marginBottom: '1rem' }}>Add New Category</h4>
            <form onSubmit={handleAddCategory} className="search-panel" style={{ padding: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Category Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-block">Add Category</button>
            </form>
          </div>

          <div>
            <h4 style={{ marginBottom: '1rem' }}>Existing Categories</h4>
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(cat => (
                    <tr key={cat.category_id}>
                      {editingCatId === cat.category_id ? (
                        <td colSpan="3">
                          <form onSubmit={handleUpdateCategory} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <input
                              type="text"
                              className="form-control"
                              value={editCatName}
                              onChange={(e) => setEditCatName(e.target.value)}
                              required
                            />
                            <textarea
                              className="form-control"
                              value={editCatDesc}
                              onChange={(e) => setEditCatDesc(e.target.value)}
                            />
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Save</button>
                              <button type="button" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setEditingCatId(null)}>Cancel</button>
                            </div>
                          </form>
                        </td>
                      ) : (
                        <>
                          <td style={{ fontWeight: 600 }}>{cat.name}</td>
                          <td>{cat.description}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleStartEditCategory(cat)}>Edit</button>
                              <button className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleDeleteCategory(cat.category_id)}>Delete</button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. ANALYTICS STATS TAB */}
      {activeTab === 'stats' && stats && (
        <div>
          {/* General Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Total Users (Students)</span>
              <span className="stat-value">{stats.generalStats?.total_students || 0}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Active Lost/Found Posts</span>
              <span className="stat-value">{stats.generalStats?.active_items || 0}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Claimed/Resolved Items</span>
              <span className="stat-value">{stats.generalStats?.claimed_items || 0}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Total Claims Logged</span>
              <span className="stat-value">
                {stats.claimStats?.reduce((acc, curr) => acc + curr.count, 0) || 0}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Category Statistics */}
            <div className="search-panel" style={{ padding: '1.25rem' }}>
              <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                Category Distribution (GROUP BY & HAVING)
              </h4>
              <table className="admin-table" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Total Items</th>
                    <th>Lost</th>
                    <th>Found</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.categoryStats?.map((c, i) => (
                    <tr key={i}>
                      <td><strong>{c.category_name}</strong></td>
                      <td>{c.total_items}</td>
                      <td>{c.lost_count}</td>
                      <td>{c.found_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Claims Status Summary */}
            <div className="search-panel" style={{ padding: '1.25rem' }}>
              <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                Claims Resolution Status
              </h4>
              <table className="admin-table" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>Claim Status</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.claimStats?.map((s, i) => (
                    <tr key={i}>
                      <td>
                        <span className={`claim-card-status ${s.claim_status}`}>{s.claim_status}</span>
                      </td>
                      <td><strong>{s.count}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. ACTIVITY LOGS TAB */}
      {activeTab === 'logs' && (
        <div>
          <h3 className="claim-card-title" style={{ marginBottom: '1rem' }}>Database Activity Log (Audit Trail)</h3>
          <div className="log-list">
            {logs.map(log => (
              <div className="log-item" key={log.log_id}>
                <div className="log-info">
                  <span className="log-action">{log.action}</span>
                  <span style={{ color: 'var(--text-main)' }}>{log.details}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>{log.user_type} (ID: {log.user_id || 'system'})</span>
                  <span className="log-date">{formatDate(log.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. MODERATION TAB */}
      {activeTab === 'moderation' && (
        <div>
          <h3 className="claim-card-title" style={{ marginBottom: '1.5rem' }}>Manage Postings</h3>
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Item Info</th>
                  <th>Location</th>
                  <th>Date Reported</th>
                  <th>Reporter</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.item_id}>
                    <td>
                      <strong>{item.item_name}</strong>
                      <br />
                      <span className={`item-badge ${item.type}`} style={{ position: 'static', padding: '0.1rem 0.4rem', fontSize: '0.65rem' }}>{item.type}</span>
                      <span className={`status-indicator ${item.item_status}`} style={{ marginLeft: '0.5rem' }}>{item.item_status}</span>
                    </td>
                    <td>{item.location}</td>
                    <td>{formatDate(item.date_reported)}</td>
                    <td>
                      {item.reporter_username || item.reporter_admin_username || 'Anonymous'}
                    </td>
                    <td>
                      <button className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleDeletePost(item.item_id)}>
                        Remove Post
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. USERS TAB */}
      {activeTab === 'users' && (
        <div>
          <h3 className="claim-card-title" style={{ marginBottom: '1.5rem' }}>Registered Students</h3>
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Roll Number</th>
                  <th>Phone Number</th>
                  <th>Date Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.user_id}>
                    <td style={{ fontWeight: 600 }}>{u.username}</td>
                    <td>{u.email}</td>
                    <td>{u.roll_number}</td>
                    <td>{u.phone_number}</td>
                    <td>{formatDate(u.created_at)}</td>
                    <td>
                      <button className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleDeleteUser(u.user_id)}>
                        Delete User
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Claim Process Remarks Modal */}
      {showRemarksModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <span>Process Claim Remarks</span>
              <button className="modal-close" onClick={() => setShowRemarksModal(false)}>×</button>
            </div>

            <form onSubmit={handleProcessClaim}>
              <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                You are about to <strong>{claimStatusAction}</strong> claim #{selectedClaimId}. Please provide remarks to notify the student.
              </p>
              
              <div className="form-group">
                <label className="form-label">Review Remarks / Reason</label>
                <textarea
                  className="form-control"
                  placeholder="Provide instructions, meet up location details for verification, or rejection explanation."
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  rows="4"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Confirm Process
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRemarksModal(false)}>
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
