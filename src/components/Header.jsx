import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, ShieldCheck, LogOut, Building2, User, Globe } from 'lucide-react';

export default function Header({
  searchQuery,
  setSearchQuery,
  currentUser,
  onLogout,
  onNavigate
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const isAgencyOwner = currentUser?.role === 'AGENCY_OWNER';

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="app-header" style={{
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      background: '#ffffff',
      borderBottom: '1px solid #eaecf0'
    }}>
      {/* Global Search Bar */}
      <div style={{ flex: 1, maxWidth: 460, position: 'relative' }}>
        <Search size={16} color="#64748b" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          placeholder={isSuperAdmin ? "Search platform agencies..." : "Search job titles, skills, candidate resumes..."}
          className="form-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            paddingLeft: 38,
            height: 40,
            borderRadius: 8,
            fontSize: 13,
            background: '#f8fafc',
            borderColor: '#eaecf0',
            width: '100%'
          }}
        />
      </div>

      {/* Top Right User Profile Dropdown Menu */}
      <div style={{ position: 'relative' }} ref={dropdownRef}>
        <div
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '6px 12px',
            borderRadius: 8,
            border: '1px solid #eaecf0',
            background: '#ffffff',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: isSuperAdmin ? '#0284c7' : '#15803d',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: 13
          }}>
            {currentUser?.name ? currentUser.name.substring(0, 2).toUpperCase() : 'US'}
          </div>

          <div style={{ fontSize: 13, lineHeight: 1.2, textAlign: 'left' }}>
            <div style={{ fontWeight: 800, color: '#0f172a' }}>{currentUser?.name || 'User Account'}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: isSuperAdmin ? '#0284c7' : '#64748b' }}>
              {isSuperAdmin ? 'SUPER ADMIN' : (currentUser?.agencyName || 'AGENCY WORKSPACE')}
            </div>
          </div>

          <ChevronDown size={14} color="#64748b" style={{ marginLeft: 4 }} />
        </div>

        {dropdownOpen && (
          <div style={{
            position: 'absolute',
            right: 0,
            top: 48,
            width: 250,
            background: '#ffffff',
            borderRadius: 12,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #eaecf0',
            zIndex: 1000,
            overflow: 'hidden',
            padding: 8
          }}>
            <div style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9', marginBottom: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{currentUser?.name}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{currentUser?.email}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 10,
                  background: isSuperAdmin ? '#eff6ff' : '#f0fdf4',
                  color: isSuperAdmin ? '#0284c7' : '#15803d',
                  border: `1px solid ${isSuperAdmin ? '#bfdbfe' : '#bbf7d0'}`
                }}>
                  {currentUser?.role}
                </span>
              </div>
            </div>

            {isSuperAdmin && (
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onNavigate('deleted-agencies');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: 'transparent',
                  color: '#0284c7',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <ShieldCheck size={16} />
                <span>Deleted Agency</span>
              </button>
            )}

            {!isSuperAdmin && isAgencyOwner && (
              <>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onNavigate('users');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: 'none',
                    background: 'transparent',
                    color: '#0284c7',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <ShieldCheck size={16} />
                  <span>User Management</span>
                </button>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onNavigate('website-settings');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: 'none',
                    background: 'transparent',
                    color: '#0284c7',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <Globe size={16} />
                  <span>Career Portal Website</span>
                </button>
              </>
            )}

            <button
              onClick={() => {
                setDropdownOpen(false);
                onLogout();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '8px 12px',
                borderRadius: 6,
                border: 'none',
                background: 'transparent',
                color: '#991b1b',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
