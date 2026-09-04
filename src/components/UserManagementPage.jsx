import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserPlus, KeyRound, UserCheck, UserX, Trash2, X, Eye, EyeOff, Copy, Check, Pencil } from 'lucide-react';
import { getAllUsers, createUser, updateUser, deleteUser } from '../services/authService';

export default function UserManagementPage({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // New User Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [newRole, setNewRole] = useState('RECRUITER');
  const [formError, setFormError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editRole, setEditRole] = useState('RECRUITER');
  const [editStatus, setEditStatus] = useState('ACTIVE');
  const [editFormError, setEditFormError] = useState(null);

  const isAllowedToManage = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'AGENCY_OWNER';

  const loadUsers = async () => {
    setIsLoading(true);
    const res = await getAllUsers(currentUser?.agencyId);
    if (res.success && Array.isArray(res.users)) {
      setUsers(res.users);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, [currentUser]);

  const generateRandomPassword = (setter) => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$';
    let pass = 'Pass@';
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setter(pass);
  };

  // Handle Create New User
  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPassword) {
      setFormError('Please fill in Name, Email, and Password.');
      return;
    }

    setFormError(null);
    const res = await createUser({
      name: newName,
      email: newEmail,
      password: newPassword,
      role: newRole,
      agencyId: currentUser?.agencyId,
      agencyName: currentUser?.agencyName || 'Agency Workspace',
      status: 'ACTIVE'
    }, currentUser?.agencyId);

    if (res.success) {
      setShowCreateModal(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('password123');
      setNewRole('RECRUITER');
      await loadUsers();
    } else {
      setFormError(res.error || 'Failed to create user.');
    }
  };

  // Handle Open Edit Modal
  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setEditName(user.name || '');
    setEditEmail(user.email || '');
    setEditPassword(user.password || 'password123');
    setEditRole(user.role || 'RECRUITER');
    setEditStatus(user.status || 'ACTIVE');
    setEditFormError(null);
  };

  // Handle Submit Edit User
  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    if (!editName || !editEmail || !editPassword) {
      setEditFormError('Please fill in Name, Email, and Password.');
      return;
    }

    setEditFormError(null);
    const updates = {
      name: editName,
      email: editEmail,
      password: editPassword,
      role: editRole,
      status: editStatus
    };

    const res = await updateUser(editingUser.id, updates);
    if (res.success) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...updates } : u));
      setEditingUser(null);
    } else {
      setEditFormError(res.error || 'Failed to update user profile.');
    }
  };

  // Toggle Disable / Enable User
  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await updateUser(user.id, { status: nextStatus });
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: nextStatus } : u));
  };

  // Handle Role Change from Table Dropdown
  const handleRoleChange = async (userId, newRoleVal) => {
    await updateUser(userId, { role: newRoleVal });
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRoleVal } : u));
  };

  // Delete User
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to remove this user from the agency?')) {
      await deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isAllowedToManage) {
    return (
      <div className="card" style={{ padding: 48, textAlign: 'center', maxWidth: 600, margin: '40px auto' }}>
        <ShieldCheck size={48} color="#dc2626" style={{ marginBottom: 12 }} />
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>Agency Admin Access Restricted</h2>
        <p style={{ fontSize: 14, color: '#64748b', marginTop: 6 }}>
          User Management is restricted to <strong>Agency Owners</strong> and <strong>Super Admins</strong>. Your current role is <strong>{currentUser?.role || 'Guest'}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">
            Agency User Management ({users.length})
          </h1>
          <p className="page-subtitle">
            Manage users, assign agency roles (Agency Owner, Manager, Recruiter, Viewer), edit profiles, and generate login credentials for <strong>{currentUser?.agencyName || 'Agency Workspace'}</strong>.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
          style={{ padding: '8px 16px', fontSize: 13, background: '#0284c7' }}
        >
          <UserPlus size={16} />
          <span>Add Agency User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Loading User Directory...</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #eaecf0' }}>
                  <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>User Name</th>
                  <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Email Address</th>
                  <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Password</th>
                  <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Agency Role</th>
                  <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 20px', fontWeight: 800, fontSize: 14, color: '#0f172a' }}>
                      {u.name}
                    </td>

                    <td style={{ padding: '16px 20px', fontSize: 13, color: '#334155' }}>
                      {u.email}
                    </td>

                    {/* User Password Display with Copy */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: 12,
                          fontWeight: 700,
                          background: '#f1f5f9',
                          color: '#0f172a',
                          padding: '3px 8px',
                          borderRadius: 4,
                          border: '1px solid #cbd5e1'
                        }}>
                          {u.password || 'password123'}
                        </span>
                        <button
                          onClick={() => copyToClipboard(u.password || 'password123', u.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedId === u.id ? '#16a34a' : '#64748b' }}
                          title="Copy Password"
                        >
                          {copiedId === u.id ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </td>

                    {/* Editable Role Selector */}
                    <td style={{ padding: '16px 20px' }}>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          padding: '4px 8px',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          background: u.role === 'AGENCY_OWNER' ? '#eff6ff' : u.role === 'RECRUITER' ? '#f0fdf4' : u.role === 'MANAGER' ? '#fff7ed' : '#ffffff',
                          color: u.role === 'AGENCY_OWNER' ? '#1d4ed8' : u.role === 'RECRUITER' ? '#15803d' : u.role === 'MANAGER' ? '#c2410c' : '#475569',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="AGENCY_OWNER">Agency Owner</option>
                        <option value="MANAGER">Manager</option>
                        <option value="RECRUITER">Recruiter</option>
                        <option value="VIEWER">Viewer</option>
                      </select>
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: 12,
                        background: u.status === 'ACTIVE' ? '#f0fdf4' : '#fef2f2',
                        color: u.status === 'ACTIVE' ? '#15803d' : '#b91c1c',
                        border: `1px solid ${u.status === 'ACTIVE' ? '#bbf7d0' : '#fecaca'}`
                      }}>
                        {u.status}
                      </span>
                    </td>

                    {/* Action Controls */}
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: 12 }}
                          onClick={() => handleOpenEditModal(u)}
                          title="Edit User Profile"
                        >
                          <Pencil size={14} color="#0284c7" />
                        </button>

                        <button
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: 12 }}
                          onClick={() => handleToggleStatus(u)}
                          title={u.status === 'ACTIVE' ? 'Suspend User' : 'Activate User'}
                        >
                          {u.status === 'ACTIVE' ? <UserX size={14} color="#dc2626" /> : <UserCheck size={14} color="#16a34a" />}
                        </button>

                        <button
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: 12 }}
                          onClick={() => handleDeleteUser(u.id)}
                          title="Delete User"
                        >
                          <Trash2 size={14} color="#991b1b" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create New User Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
        }} onClick={() => setShowCreateModal(false)}>
          <div style={{ width: '100%', maxWidth: 480, background: '#ffffff', borderRadius: 12, padding: 28 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Add Agency User</h3>
              <button className="btn btn-secondary" style={{ padding: 6 }} onClick={() => setShowCreateModal(false)}><X size={16} /></button>
            </div>

            {formError && <div style={{ background: '#fef2f2', color: '#991b1b', padding: 10, borderRadius: 6, fontSize: 13, marginBottom: 16 }}>{formError}</div>}

            <form onSubmit={handleCreateUserSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Full Name *</label>
                <input type="text" className="form-input" value={newName} onChange={e => setNewName(e.target.value)} required placeholder="e.g. Rahul Sharma" style={{ width: '100%', height: 38, marginTop: 4 }} />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Email Address *</label>
                <input type="email" className="form-input" value={newEmail} onChange={e => setNewEmail(e.target.value)} required placeholder="rahul@agency.com" style={{ width: '100%', height: 38, marginTop: 4 }} />
              </div>

              {/* Password Input with Auto-Generate and Hide/Show */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Account Password *</label>
                  <button
                    type="button"
                    onClick={() => generateRandomPassword(setNewPassword)}
                    style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                  >
                    ⚡ Generate Password
                  </button>
                </div>
                <div style={{ position: 'relative', marginTop: 4 }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    style={{ width: '100%', height: 38, paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: 10, top: 9, background: 'none', border: 'none',
                      color: '#64748b', cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Assign Agency Role *</label>
                <select className="form-input" value={newRole} onChange={e => setNewRole(e.target.value)} style={{ width: '100%', height: 38, marginTop: 4 }}>
                  <option value="AGENCY_OWNER">Agency Owner</option>
                  <option value="MANAGER">Manager</option>
                  <option value="RECRUITER">Recruiter</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ background: '#0284c7' }}>Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Profile Modal */}
      {editingUser && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
        }} onClick={() => setEditingUser(null)}>
          <div style={{ width: '100%', maxWidth: 480, background: '#ffffff', borderRadius: 12, padding: 28 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Pencil size={18} color="#0284c7" />
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Edit Agency User Profile</h3>
              </div>
              <button className="btn btn-secondary" style={{ padding: 6 }} onClick={() => setEditingUser(null)}><X size={16} /></button>
            </div>

            {editFormError && <div style={{ background: '#fef2f2', color: '#991b1b', padding: 10, borderRadius: 6, fontSize: 13, marginBottom: 16 }}>{editFormError}</div>}

            <form onSubmit={handleEditUserSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  required
                  style={{ width: '100%', height: 38, marginTop: 4 }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  required
                  style={{ width: '100%', height: 38, marginTop: 4 }}
                />
              </div>

              {/* Password Input with Auto-Generate and Hide/Show */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Account Password *</label>
                  <button
                    type="button"
                    onClick={() => generateRandomPassword(setEditPassword)}
                    style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                  >
                    ⚡ Generate Password
                  </button>
                </div>
                <div style={{ position: 'relative', marginTop: 4 }}>
                  <input
                    type={showEditPassword ? "text" : "password"}
                    className="form-input"
                    value={editPassword}
                    onChange={e => setEditPassword(e.target.value)}
                    placeholder="Update password"
                    required
                    style={{ width: '100%', height: 38, paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    style={{
                      position: 'absolute', right: 10, top: 9, background: 'none', border: 'none',
                      color: '#64748b', cursor: 'pointer'
                    }}
                  >
                    {showEditPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Assign Agency Role *</label>
                <select className="form-input" value={editRole} onChange={e => setEditRole(e.target.value)} style={{ width: '100%', height: 38, marginTop: 4 }}>
                  <option value="AGENCY_OWNER">Agency Owner</option>
                  <option value="MANAGER">Manager</option>
                  <option value="RECRUITER">Recruiter</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Account Status *</label>
                <select className="form-input" value={editStatus} onChange={e => setEditStatus(e.target.value)} style={{ width: '100%', height: 38, marginTop: 4 }}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingUser(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ background: '#0284c7' }}>Update Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
