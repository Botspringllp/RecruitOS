import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import JobDashboard from './components/JobDashboard';
import CreateJobPage from './components/CreateJobPage';
import JobDetailsPage from './components/JobDetailsPage';
import CandidatesPage from './components/CandidatesPage';
import UserManagementPage from './components/UserManagementPage';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import DeletedAgenciesPage from './components/DeletedAgenciesPage';
import AgencyWebsiteSettings from './components/AgencyWebsiteSettings';
import LoginPage from './components/LoginPage';
import PublicPortalContainer from './public_portal/PublicPortalContainer';

import { getAllJobs, createJob, getJobById } from './services/jobsService';
import { getCurrentUser, logoutUser } from './services/authService';
import { checkSupabaseHealth } from './services/supabase';
import { Loader2, AlertCircle, RefreshCw, ShieldAlert } from 'lucide-react';

function parsePublicRoute() {
  if (typeof window === 'undefined') return { isPublic: false };

  const hash = window.location.hash || '';
  const path = window.location.pathname || '';
  const full = hash.replace(/^#/, '') || path;

  const match = full.match(/^\/agency\/([^\/]+)(?:\/([^\/]+))?(?:\/([^\/]+))?/);
  if (match) {
    const slug = match[1];
    const sub = match[2] || 'home';
    const detailId = sub === 'jobs' && match[3] ? match[3] : null;
    return { isPublic: true, slug, tab: sub === 'jobs' && detailId ? 'job-detail' : sub, jobId: detailId };
  }
  return { isPublic: false };
}

export default function App() {
  const [publicRoute, setPublicRoute] = useState(() => parsePublicRoute());
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [currentView, setCurrentView] = useState(() => {
    const user = getCurrentUser();
    return user?.role === 'SUPER_ADMIN' ? 'super-admin' : 'dashboard';
  });
  const [searchQuery, setSearchQuery] = useState('');
  
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    function handleHashChange() {
      setPublicRoute(parsePublicRoute());
    }
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const loadJobsFromDatabase = useCallback(async () => {
    if (!currentUser) return;
    if (currentUser.role === 'SUPER_ADMIN') {
      setJobs([]);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    await checkSupabaseHealth();
    const result = await getAllJobs(currentUser.agencyId, currentUser.role);
    if (result.success && Array.isArray(result.jobs)) {
      setJobs(result.jobs);
      setErrorMsg(null);
    } else {
      setJobs([]);
      if (result.error) {
        setErrorMsg(result.error);
      }
    }
    setIsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'SUPER_ADMIN' && currentView === 'dashboard') {
        setCurrentView('super-admin');
      } else if (currentUser.role !== 'SUPER_ADMIN' && currentView === 'super-admin') {
        setCurrentView('dashboard');
      }
      loadJobsFromDatabase();
    }
  }, [currentUser, currentView, loadJobsFromDatabase]);

  // If visiting a public agency portal route (/agency/:slug)
  if (publicRoute.isPublic) {
    return <PublicPortalContainer slug={publicRoute.slug} initialTab={publicRoute.tab} initialJobId={publicRoute.jobId} />;
  }

  const handleLoginSuccess = (userObj) => {
    setCurrentUser(userObj);
    if (userObj.role === 'SUPER_ADMIN') {
      setCurrentView('super-admin');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  const handleOpenCreateJobPage = () => {
    if (currentUser?.role === 'VIEWER') {
      alert('Viewer role has read-only access. You cannot create new job mandates.');
      return;
    }
    setCurrentView('create-job');
  };

  const handleSaveJob = async (newJobData) => {
    setIsLoading(true);
    const res = await createJob(newJobData, currentUser?.agencyId);
    
    if (!res.success && res.error) {
      setErrorMsg(res.error);
    }
    
    setCurrentView('dashboard');
    await loadJobsFromDatabase();
  };

  const handleSelectJob = async (jobId) => {
    setSelectedJobId(jobId);
    setCurrentView('job-detail');

    const singleRes = await getJobById(jobId, currentUser?.agencyId);
    if (singleRes.success && singleRes.job) {
      setJobs(prevJobs => prevJobs.map(j => j.id === jobId ? { ...j, ...singleRes.job } : j));
    }
  };

  const handleUploadResumesForJob = (jobId, newCandidates) => {
    setJobs(prevJobs => prevJobs.map(j => {
      if (j.id === jobId) {
        const existingCandidates = j.candidates || [];
        const updatedCandidates = [...newCandidates, ...existingCandidates].sort((a, b) => b.matchPercentage - a.matchPercentage);
        const totalCount = updatedCandidates.length;
        const avgScore = totalCount > 0
          ? Math.round(updatedCandidates.reduce((acc, c) => acc + (c.matchPercentage || 0), 0) / totalCount)
          : 0;

        return {
          ...j,
          totalUploadedResumes: totalCount,
          totalParsedResumes: totalCount,
          avgMatchScore: avgScore,
          candidates: updatedCandidates
        };
      }
      return j;
    }));
  };

  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Suspended Agency Workspace View
  if (currentUser.status === 'SUSPENDED') {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0f172a',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24
      }}>
        <div style={{
          background: '#1e293b',
          borderRadius: 16,
          padding: 40,
          maxWidth: 480,
          textAlign: 'center',
          border: '1px solid #e11d48'
        }}>
          <ShieldAlert size={54} color="#e11d48" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', marginBottom: 10 }}>Workspace Suspended</h2>
          <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6, marginBottom: 24 }}>
            Access to <strong>{currentUser.agencyName || 'this Agency Workspace'}</strong> has been suspended by the Platform Super Admin. All business data and operations are restricted until reactivation.
          </p>
          <button
            onClick={handleLogout}
            style={{
              background: '#e11d48',
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const selectedJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  const filteredJobs = jobs.filter(j => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (j.jobTitle && j.jobTitle.toLowerCase().includes(q)) ||
      (j.location && j.location.toLowerCase().includes(q)) ||
      (j.requiredSkills && j.requiredSkills.some(s => s.toLowerCase().includes(q)))
    );
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        currentUser={currentUser}
        onOpenCreateJob={handleOpenCreateJobPage}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentUser={currentUser}
          onLogout={handleLogout}
          onNavigate={setCurrentView}
        />

        <main style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          {errorMsg && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '12px 20px',
              borderRadius: 8,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'between',
              fontSize: 14
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertCircle size={18} />
                <span><strong>Database Notice:</strong> {errorMsg}</span>
              </div>
              <button
                className="btn btn-secondary"
                onClick={loadJobsFromDatabase}
                style={{ padding: '4px 10px', fontSize: 12 }}
              >
                <RefreshCw size={14} />
                <span>Retry</span>
              </button>
            </div>
          )}

          {isLoading && currentView === 'dashboard' && jobs.length === 0 && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 20px',
              color: '#64748b'
            }}>
              <Loader2 size={36} color="#0284c7" className="animate-spin" style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                Loading Agency Mandates...
              </div>
            </div>
          )}

          {/* Super Admin Protected Platform Routing */}
          {currentUser.role === 'SUPER_ADMIN' ? (
            <>
              {currentView === 'super-admin' && (
                <SuperAdminDashboard currentUser={currentUser} />
              )}
              {currentView === 'deleted-agencies' && (
                <DeletedAgenciesPage currentUser={currentUser} />
              )}
              {currentView === 'users' && (
                <UserManagementPage currentUser={currentUser} />
              )}
            </>
          ) : (
            /* Agency Workspace Protected Routing */
            <>
              {currentView === 'dashboard' && (
                <JobDashboard
                  jobs={filteredJobs}
                  onOpenCreateJobPage={handleOpenCreateJobPage}
                  onSelectJob={handleSelectJob}
                  onOpenResumeUpload={handleSelectJob}
                  currentUser={currentUser}
                />
              )}

              {currentView === 'candidates' && (
                <CandidatesPage searchQuery={searchQuery} jobs={jobs} currentUser={currentUser} />
              )}

              {currentView === 'users' && (
                <UserManagementPage currentUser={currentUser} />
              )}

              {currentView === 'website-settings' && (
                <AgencyWebsiteSettings
                  agency={{
                    id: currentUser.agencyId,
                    name: currentUser.agencyName,
                    slug: currentUser.agencyName?.toLowerCase().replace(/\s+/g, '-'),
                    ownerEmail: currentUser.email
                  }}
                  onUpdateSuccess={loadJobsFromDatabase}
                />
              )}

              {currentView === 'create-job' && (
                <CreateJobPage
                  onBack={() => setCurrentView('dashboard')}
                  onSaveJob={handleSaveJob}
                  currentUser={currentUser}
                />
              )}

              {currentView === 'job-detail' && (
                <JobDetailsPage
                  job={selectedJob}
                  onBack={() => setCurrentView('dashboard')}
                  onUploadResumesForJob={handleUploadResumesForJob}
                  currentUser={currentUser}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
