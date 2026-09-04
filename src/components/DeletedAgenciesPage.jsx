import React, { useState, useEffect } from 'react';
import { Trash2, Search, RefreshCw, RotateCcw, Building2, ExternalLink, ShieldAlert } from 'lucide-react';
import { getAllAgencies, restoreAgency } from '../services/agencyService';

export default function DeletedAgenciesPage({ currentUser }) {
  const [agencies, setAgencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadDeletedAgencies = async () => {
    setIsLoading(true);
    const res = await getAllAgencies();
    if (res.success && Array.isArray(res.agencies)) {
      setAgencies(res.agencies);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadDeletedAgencies();
  }, []);

  const handleRestoreAgency = async (agencyId, agencyName) => {
    if (window.confirm(`Are you sure you want to restore "${agencyName}" back to active agencies?`)) {
      await restoreAgency(agencyId);
      setAgencies(prev => prev.map(a => a.id === agencyId ? { ...a, status: 'ACTIVE' } : a));
    }
  };

  // Strictly filter only DELETED agencies
  const deletedAgencies = agencies.filter(a => a.status === 'DELETED');
  const filteredDeletedAgencies = deletedAgencies.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.ownerEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      {/* Top Banner */}
      <div style={{
        background: '#0f172a',
        borderRadius: 16,
        padding: '24px 32px',
        color: '#ffffff',
        marginBottom: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <Trash2 size={24} color="#e11d48" />
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Deleted Agencies Archive</h1>
          </div>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
            View and manage agencies deleted from the main directory. No "+ Add Agency" provisioning controls allowed on this archive page.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={loadDeletedAgencies}
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 8,
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 700,
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <RefreshCw size={14} />
            <span>Refresh Archive</span>
          </button>
        </div>
      </div>

      {/* Deleted Agencies Table Container */}
      <div style={{
        background: '#ffffff',
        borderRadius: 12,
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}>
        {/* Header Controls */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc'
        }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
            Deleted Agencies ({filteredDeletedAgencies.length})
          </div>

          <div style={{ position: 'relative', width: 280 }}>
            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: 10, top: 10 }} />
            <input
              type="text"
              placeholder="Search deleted agencies..."
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
        </div>

        {/* Table View */}
        {isLoading ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Loading Deleted Agencies...</div>
          </div>
        ) : filteredDeletedAgencies.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center', color: '#64748b' }}>
            <Building2 size={44} color="#cbd5e1" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>No Deleted Agencies Found</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Agencies deleted from the main directory will appear here.</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f1f5f9', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 20px', fontWeight: 700 }}>Agency Name</th>
                <th style={{ padding: '12px 20px', fontWeight: 700 }}>Agency Owner</th>
                <th style={{ padding: '12px 20px', fontWeight: 700 }}>Subscription Plan</th>
                <th style={{ padding: '12px 20px', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '12px 20px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeletedAgencies.map((agency) => (
                <tr key={agency.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 600, color: '#0f172a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Building2 size={16} color="#e11d48" />
                      <div>
                        <div style={{ fontWeight: 700, color: '#991b1b' }}>{agency.name}</div>
                        <span style={{ fontSize: 11, color: '#64748b' }}>/agency/{agency.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', color: '#334155' }}>
                    <div style={{ fontWeight: 600 }}>{agency.ownerName}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{agency.ownerEmail}</div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 10, background: '#f1f5f9', color: '#475569' }}>
                      {agency.plan}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 12, background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
                      DELETED
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleRestoreAgency(agency.id, agency.name)}
                      style={{
                        background: '#f0fdf4',
                        color: '#15803d',
                        border: '1px solid #bbf7d0',
                        borderRadius: 6,
                        padding: '6px 12px',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <RotateCcw size={14} />
                      <span>Restore Agency</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
