import React, { useState, useEffect } from 'react';
import PublicAgencyLayout from './PublicAgencyLayout';
import PublicAgencyHome from './PublicAgencyHome';
import PublicAgencyAbout from './PublicAgencyAbout';
import PublicAgencyJobs from './PublicAgencyJobs';
import PublicJobDetailsPage from './PublicJobDetailsPage';
import PublicAgencyServices from './PublicAgencyServices';
import PublicAgencyEmployers from './PublicAgencyEmployers';
import PublicAgencyIndustries from './PublicAgencyIndustries';
import PublicAgencyContact from './PublicAgencyContact';
import PublicAgencyBlog from './PublicAgencyBlog';

import { getAgencyBySlug, getPublicAgencyJobs } from '../services/publicAgencyService';
import { Loader2, AlertCircle } from 'lucide-react';

export default function PublicPortalContainer({ slug, initialTab = 'home', initialJobId = null }) {
  const [agency, setAgency] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [currentTab, setCurrentTab] = useState(initialTab);
  const [selectedJobId, setSelectedJobId] = useState(initialJobId);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPortalData() {
      setIsLoading(true);
      setError(null);

      const agencyRes = await getAgencyBySlug(slug);
      if (agencyRes.success && agencyRes.agency) {
        setAgency(agencyRes.agency);

        // Fetch agency's public jobs
        const jobsRes = await getPublicAgencyJobs(agencyRes.agency.id);
        if (jobsRes.success) {
          setJobs(jobsRes.jobs);
        }
      } else {
        setError(agencyRes.error || 'Agency career portal not found.');
      }

      setIsLoading(false);
    }

    loadPortalData();
  }, [slug]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#ffffff' }}>
        <Loader2 size={42} color="#0284c7" className="spin-icon" style={{ marginBottom: 16 }} />
        <h2 style={{ fontSize: 18, fontWeight: 800 }}>Loading Agency Career Portal...</h2>
        <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Connecting to agency database</p>
      </div>
    );
  }

  if (error || !agency) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: 24, textAlign: 'center' }}>
        <AlertCircle size={54} color="#e11d48" style={{ marginBottom: 16 }} />
        <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>Agency Portal Not Found</h2>
        <p style={{ fontSize: 14, color: '#64748b', maxWidth: 460, marginBottom: 24 }}>
          The requested agency career site <code>/agency/{slug}</code> could not be located in the database.
        </p>
        <a href="/" style={{ padding: '10px 20px', borderRadius: 8, background: '#0284c7', color: '#ffffff', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
          Return to RecruitOS
        </a>
      </div>
    );
  }

  const selectedJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  const handleSelectJob = (jobId) => {
    setSelectedJobId(jobId);
    setCurrentTab('job-detail');
    window.location.hash = `/agency/${slug}/jobs/${jobId}`;
  };

  const handleNavigateTab = (tabId) => {
    setCurrentTab(tabId);
    window.location.hash = `/agency/${slug}/${tabId === 'home' ? '' : tabId}`;
  };

  return (
    <PublicAgencyLayout agency={agency} currentTab={currentTab} onNavigateTab={handleNavigateTab}>
      {currentTab === 'home' && (
        <PublicAgencyHome agency={agency} jobs={jobs} onNavigateTab={handleNavigateTab} onSelectJob={handleSelectJob} />
      )}
      {currentTab === 'about' && (
        <PublicAgencyAbout agency={agency} />
      )}
      {currentTab === 'jobs' && (
        <PublicAgencyJobs agency={agency} jobs={jobs} onSelectJob={handleSelectJob} />
      )}
      {currentTab === 'job-detail' && (
        <PublicJobDetailsPage agency={agency} job={selectedJob} onBack={() => handleNavigateTab('jobs')} />
      )}
      {currentTab === 'services' && (
        <PublicAgencyServices agency={agency} onNavigateTab={handleNavigateTab} />
      )}
      {currentTab === 'employers' && (
        <PublicAgencyEmployers agency={agency} />
      )}
      {currentTab === 'industries' && (
        <PublicAgencyIndustries agency={agency} />
      )}
      {currentTab === 'contact' && (
        <PublicAgencyContact agency={agency} />
      )}
      {currentTab === 'blog' && (
        <PublicAgencyBlog agency={agency} />
      )}
    </PublicAgencyLayout>
  );
}
