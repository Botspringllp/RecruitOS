import React, { useState, useEffect } from 'react';
import { 
  Building2, CheckCircle2, AlertTriangle, ShieldCheck, 
  Plus, Search, RefreshCw, Power, Key, Copy, Check, X, Trash2, ExternalLink
} from 'lucide-react';
import { getAllAgencies, createAgency, updateAgencyStatus, deleteAgency, clearMockAgencies } from '../services/agencyService';

export default function SuperAdminDashboard({ currentUser }) {
  const [agencies, setAgencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copied, setCopied] = useState(false);

  const [newAgencyForm, setNewAgencyForm] = useState({
    name: '',
    ownerName: '',
    ownerEmail: '',
    password: '',
    plan: 'Enterprise'
  });

  const loadAgencies = async () => {
    setIsLoading(true);
    const res = await getAllAgencies();
    if (res.success && Array.isArray(res.agencies)) {
      setAgencies(res.agencies);
    }
    setIsLoading(false);
  };

  const handlePurgeCache = async () => {
    clearMockAgencies();
    await loadAgencies();
  };

  useEffect(() => {
    loadAgencies();
  }, []);

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let randPass = '';
    for (let i = 0; i < 10; i++) {
      randPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewAgencyForm(prev => ({ ...prev, password: randPass }));
  };

  const handleToggleStatus = async (agencyId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await updateAgencyStatus(agencyId, nextStatus);
    setAgencies(prev => prev.map(a => a.id === agencyId ? { ...a, status: nextStatus } : a));
  };

  const handleDeleteAgency = async (agencyId, agencyName) => {
    if (window.confirm(`Are you sure you want to delete "${agencyName}"? This action cannot be undone.`)) {
      await deleteAgency(agencyId);
      setAgencies(prev => prev.filter(a => a.id !== agencyId));
    }
  };

  const handleCreateAgency = async (e) => {
    e.preventDefault();
    if (!newAgencyForm.name || !newAgencyForm.ownerEmail || !newAgencyForm.password) return;

    setIsSubmitting(true);
    const res = await createAgency(newAgencyForm);
    setIsSubmitting(false);

    if (res.success && res.agency) {
      setCreatedCredentials({
        agencyName: newAgencyForm.name,
        ownerName: newAgencyForm.ownerName,
        email: newAgencyForm.ownerEmail,
        password: newAgencyForm.password
      });
      setAgencies(prev => [res.agency, ...prev.filter(a => a.id !== res.agency.id)]);
      setNewAgencyForm({ name: '', ownerName: '', ownerEmail: '', password: '', plan: 'Enterprise' });
      setShowCreateModal(false);
      await loadAgencies();
    }
  };

  const copyToClipboard = () => {
    if (!createdCredentials) return;
    const text = `RecruitOS Agency Credentials:\nAgency: ${createdCredentials.agencyName}\nOwner: ${createdCredentials.ownerName}\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const activeOrSuspendedAgencies = agencies.filter(a => a.status !== 'DELETED');

  const filteredAgencies = activeOrSuspendedAgencies.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.ownerEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAgencies = activeOrSuspendedAgencies.length;
  const activeAgencies = activeOrSuspendedAgencies.filter(a => a.status === 'ACTIVE').length;
  const suspendedAgencies = activeOrSuspendedAgencies.filter(a => a.status === 'SUSPENDED').length;

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Super Admin Top Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: '#ffffff',
        borderRadius: 12,
        padding: '24px 32px',
        marginBottom: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <ShieldCheck size={24} color="#38bdf8" />
            <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
              RecruitOS Platform Super Admin
            </span>
            <span style={{
              background: '#0284c7',
              color: '#ffffff',
              fontSize: 11,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 4,
              textTransform: 'uppercase'
            }}>
              Platform Management Only
            </span>
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>
            System-level agency provisioning, credential generation, and workspace lifecycle control. Business data boundary enforced.
          </div>
        </div>

        <button
          onClick={() => {
            handleGeneratePassword();
            setShowCreateModal(true);
          }}
          style={{
            background: '#0284c7',
            color: '#ffffff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 18px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 2px 6px rgba(2, 132, 199, 0.4)'
          }}
        >
          <Plus size={16} />
          <span>Provision New Agency</span>
        </button>
      </div>

      {/* Platform Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 20,
        marginBottom: 28
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: 10,
          padding: 20,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: 16
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            background: '#eff6ff',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Building2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Total Agencies</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a' }}>{totalAgencies}</div>
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: 10,
          padding: 20,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: 16
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            background: '#f0fdf4',
            color: '#16a34a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Active Workspaces</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#16a34a' }}>{activeAgencies}</div>
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: 10,
          padding: 20,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: 16
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            background: '#fff1f2',
            color: '#e11d48',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Suspended Workspaces</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#e11d48' }}>{suspendedAgencies}</div>
          </div>
        </div>
      </div>

      {/* Agency Management Table Container */}
      <div style={{
        background: '#ffffff',
        borderRadius: 12,
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}>
        {/* Table Header Controls */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc'
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
            Agencies Directory ({filteredAgencies.length})
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              position: 'relative',
              width: 260
            }}>
              <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: 10, top: 10 }} />
              <input
                type="text"
                placeholder="Search agencies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 32px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  fontSize: 13
                }}
              />
            </div>

            <button
              onClick={handlePurgeCache}
              title="Clear cached browser data and sync from database"
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: 6,
                padding: '7px 12px',
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <RefreshCw size={14} />
              <span>Sync Database</span>
            </button>
          </div>
        </div>

        {/* Table View */}
        {filteredAgencies.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#64748b' }}>
            <Building2 size={42} color="#cbd5e1" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>No Agencies Found in Database</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Click "Provision New Agency" above to register your first client agency.</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f1f5f9', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Agency Name</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Agency Owner</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Subscription Plan</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Created Date</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAgencies.map((agency) => (
                <tr key={agency.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 600, color: '#0f172a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Building2 size={16} color="#0284c7" />
                      <div>
                        <div style={{ fontWeight: 700 }}>{agency.name}</div>
                        <a
                          href={`/#/agency/${agency.slug || agency.name.toLowerCase().replace(/\s+/g, '-')}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: 11, color: '#0284c7', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 2, marginTop: 2 }}
                        >
                          <span>/agency/{agency.slug || agency.name.toLowerCase().replace(/\s+/g, '-')}</span>
                          <ExternalLink size={11} />
                        </a>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', color: '#334155' }}>
                    <div style={{ fontWeight: 500 }}>{agency.ownerName}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{agency.ownerEmail}</div>
                  </td>
                  <td style={{ padding: '14px 20px', color: '#475569' }}>
                    <span style={{
                      background: '#e0f2fe',
                      color: '#0369a1',
                      fontSize: 12,
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: 4
                    }}>
                      {agency.plan}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', color: '#64748b' }}>{agency.createdAt}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 10px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 600,
                      background: agency.status === 'ACTIVE' ? '#dcfce7' : '#ffe4e6',
                      color: agency.status === 'ACTIVE' ? '#15803d' : '#be123c'
                    }}>
                      {agency.status === 'ACTIVE' ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                      {agency.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                      <button
                        onClick={() => handleToggleStatus(agency.id, agency.status)}
                        style={{
                          background: agency.status === 'ACTIVE' ? '#fff1f2' : '#f0fdf4',
                          color: agency.status === 'ACTIVE' ? '#be123c' : '#15803d',
                          border: `1px solid ${agency.status === 'ACTIVE' ? '#fecdd3' : '#bbf7d0'}`,
                          borderRadius: 6,
                          padding: '6px 12px',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <Power size={13} />
                        <span>{agency.status === 'ACTIVE' ? 'Suspend Agency' : 'Activate Agency'}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteAgency(agency.id, agency.name)}
                        title="Delete Agency"
                        style={{
                          background: '#f8fafc',
                          color: '#ef4444',
                          border: '1px solid #e2e8f0',
                          borderRadius: 6,
                          padding: '6px 8px',
                          fontSize: 12,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Provision Agency Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 12,
            width: 480,
            padding: 24,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
                Provision New Recruitment Agency
              </div>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleCreateAgency}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Agency Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Global Talent"
                  value={newAgencyForm.name}
                  onChange={(e) => setNewAgencyForm({ ...newAgencyForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Agency Owner Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Miller"
                  value={newAgencyForm.ownerName}
                  onChange={(e) => setNewAgencyForm({ ...newAgencyForm, ownerName: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Agency Owner Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. owner@apexrecruitment.com"
                  value={newAgencyForm.ownerEmail}
                  onChange={(e) => setNewAgencyForm({ ...newAgencyForm, ownerEmail: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              {/* Password Generator Field */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>Agency Owner Password</label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: 4,
                      padding: '2px 8px',
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#0284c7',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <Key size={12} />
                    <span>Generate Password</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Set initial password for Agency Owner"
                  value={newAgencyForm.password}
                  onChange={(e) => setNewAgencyForm({ ...newAgencyForm, password: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Subscription Plan</label>
                <select
                  value={newAgencyForm.plan}
                  onChange={(e) => setNewAgencyForm({ ...newAgencyForm, plan: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                >
                  <option value="Enterprise">Enterprise</option>
                  <option value="Growth">Growth</option>
                  <option value="Starter">Starter</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 6, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ background: '#0284c7', color: '#ffffff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  {isSubmitting ? 'Provisioning...' : 'Provision Agency & Owner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Credentials Modal */}
      {createdCredentials && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 12,
            width: 440,
            padding: 28,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            textAlign: 'center'
          }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <CheckCircle2 size={28} />
            </div>

            <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
              Agency Provisioned Successfully!
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
              Share these login credentials with the Agency Owner to access their workspace.
            </div>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: 16,
              textAlign: 'left',
              marginBottom: 20,
              fontSize: 13
            }}>
              <div style={{ marginBottom: 8 }}>
                <span style={{ color: '#64748b', fontSize: 12 }}>Agency Name:</span>{' '}
                <strong style={{ color: '#0f172a' }}>{createdCredentials.agencyName}</strong>
              </div>
              <div style={{ marginBottom: 8 }}>
                <span style={{ color: '#64748b', fontSize: 12 }}>Owner Name:</span>{' '}
                <strong style={{ color: '#0f172a' }}>{createdCredentials.ownerName}</strong>
              </div>
              <div style={{ marginBottom: 8 }}>
                <span style={{ color: '#64748b', fontSize: 12 }}>Email Address:</span>{' '}
                <strong style={{ color: '#0284c7' }}>{createdCredentials.email}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: 12 }}>Assigned Password:</span>{' '}
                <code style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                  {createdCredentials.password}
                </code>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={copyToClipboard}
                style={{
                  flex: 1,
                  background: copied ? '#16a34a' : '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '10px 14px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Credentials Copied!' : 'Copy Credentials'}</span>
              </button>
              <button
                onClick={() => setCreatedCredentials(null)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  padding: '10px 16px',
                  fontSize: 13,
                  cursor: 'pointer'
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
