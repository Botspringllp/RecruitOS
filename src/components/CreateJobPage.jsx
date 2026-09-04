import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, Sparkles, CheckCircle2, FileText, Loader2, Layers, AlertCircle } from 'lucide-react';
import { readTextFromFileClient, extractDynamicJdData } from '../services/parserService';

export default function CreateJobPage({ onBack, onSaveJob }) {
  // Active Upload Tab: 'single' | 'bulk'
  const [uploadMode, setUploadMode] = useState('single');
  const [singleFile, setSingleFile] = useState(null);
  const [bulkFiles, setBulkFiles] = useState([]);
  
  // File Input References for Native File Picker
  const singleInputRef = useRef(null);
  const bulkInputRef = useRef(null);

  // AI Parsing State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [parseNotice, setParseNotice] = useState(null);

  // Auto-filled & Editable Form Fields
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [requiredSkillsInput, setRequiredSkillsInput] = useState('');
  const [experienceRequired, setExperienceRequired] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState('Full Time, Permanent');
  const [industryType, setIndustryType] = useState('IT Services & Consulting');
  const [department, setDepartment] = useState('Engineering / Software');
  const [roleCategory, setRoleCategory] = useState('Software Development');

  // Handle File Selection
  const handleSingleSelect = (file) => {
    setParseNotice(null);
    if (file) {
      setSingleFile(file);
    }
  };

  const handleBulkSelect = (files) => {
    setParseNotice(null);
    if (files && files.length > 0) {
      setBulkFiles(Array.from(files));
    }
  };

  // Trigger Real Backend JD Analysis (pdf-parse / mammoth + Gemini API + Regex)
  const handleAnalyzeJD = async () => {
    const fileToUpload = uploadMode === 'single' ? singleFile : (bulkFiles.length > 0 ? bulkFiles[0] : null);
    
    if (!fileToUpload) {
      setParseNotice('Please select a valid PDF or DOCX file from your computer.');
      return;
    }

    setIsAnalyzing(true);
    setParseNotice(null);

    // Read PDF/DOCX text directly in browser client
    const rawPdfText = await readTextFromFileClient(fileToUpload);
    const clientExtracted = extractDynamicJdData(fileToUpload.name, rawPdfText);

    console.log('📌 [RecruitOS Workflow] Selected Job Requirement File:', fileToUpload.name, `(${fileToUpload.size} bytes)`);
    console.log('⚡ [RecruitOS Extraction Engine] Extracted Job Title:', clientExtracted.title);
    console.log('🏢 [RecruitOS Extraction Engine] Extracted Company Name:', clientExtracted.company_name);
    console.log('📍 [RecruitOS Extraction Engine] Extracted Location:', clientExtracted.location);
    console.log('💼 [RecruitOS Extraction Engine] Extracted Experience:', clientExtracted.experience);
    console.log('🛠️ [RecruitOS Extraction Engine] Extracted Required Skills:', clientExtracted.allRequiredSkills.join(', '));

    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);

      const res = await fetch('/api/jd/analyze', {
        method: 'POST',
        body: formData
      });

      const responseText = await res.text();
      let json = null;

      if (responseText && responseText.trim()) {
        try {
          json = JSON.parse(responseText);
        } catch (parseErr) {
          console.warn('[CreateJobPage] Non-JSON response received');
        }
      }

      if (res.ok && json && json.success && json.data) {
        const d = json.data;
        setJobTitle(d.job_title || d.title || clientExtracted.title);
        setCompanyName(d.company_name || clientExtracted.company_name);
        setJobDescription(d.job_description || d.job_summary || d.summary || clientExtracted.jobDescription);
        
        // Single Combined Skills List
        const allSkillsArr = Array.isArray(d.required_skills) && d.required_skills.length > 0
          ? d.required_skills
          : Array.isArray(d.mandatory_skills) && d.mandatory_skills.length > 0
            ? d.mandatory_skills.concat(d.good_to_have_skills || [])
            : clientExtracted.allRequiredSkills;
            
        setRequiredSkillsInput(allSkillsArr.join(', '));
        setExperienceRequired(d.experience_required || clientExtracted.experience);
        setLocation(d.location || clientExtracted.location);
        setEmploymentType(d.employment_type || clientExtracted.employmentType);
        setIndustryType(d.industry_type || clientExtracted.industry);
        setDepartment(d.department || clientExtracted.department);
        setRoleCategory(d.role_category || clientExtracted.roleCategory);

        setIsAnalyzed(true);
      } else {
        throw new Error(`Server status ${res.status}`);
      }
    } catch (err) {
      console.warn('[CreateJobPage] Using dynamic document extractor for file:', fileToUpload.name);
      
      // Auto-fill dynamically using clean document extractor for THIS file
      setJobTitle(clientExtracted.title);
      setCompanyName(clientExtracted.company_name);
      setJobDescription(clientExtracted.jobDescription);
      setRequiredSkillsInput(clientExtracted.allRequiredSkills.join(', '));
      setExperienceRequired(clientExtracted.experience);
      setLocation(clientExtracted.location);
      setEmploymentType(clientExtracted.employmentType);
      setIndustryType(clientExtracted.industry);
      setDepartment(clientExtracted.department);
      setRoleCategory(clientExtracted.roleCategory);

      setIsAnalyzed(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save Job to Supabase Database
  const handleSubmitSave = (e) => {
    e.preventDefault();
    if (!jobTitle) return;

    const skillsArr = requiredSkillsInput.split(',').map(s => s.trim()).filter(Boolean);

    const newJob = {
      jobTitle,
      companyName,
      jobSummary: jobDescription, // Save exact extracted Job Description
      requiredSkills: skillsArr,
      mandatorySkills: skillsArr,
      goodToHaveSkills: [],
      experienceRequired: experienceRequired || 'Not Specified',
      location: location || 'Remote',
      employmentType: employmentType || 'Full Time, Permanent',
      industryType,
      department,
      roleCategory
    };

    onSaveJob(newJob);
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Hidden Native File Inputs */}
      <input
        ref={singleInputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleSingleSelect(e.target.files[0]);
          }
        }}
      />
      <input
        ref={bulkInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files) {
            handleBulkSelect(e.target.files);
          }
        }}
      />

      {/* Top Header Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <button
            className="btn btn-secondary"
            style={{ padding: '6px 14px', fontSize: 13, marginBottom: 10 }}
            onClick={onBack}
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="page-title">Upload Job Requirement</h1>
          <p className="page-subtitle">
            Upload Job Description PDF/DOCX files to trigger text extraction and AI Gemini parsing.
          </p>
        </div>
      </div>

      {parseNotice && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          padding: '12px 16px',
          borderRadius: 8,
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 14
        }}>
          <AlertCircle size={18} />
          <span>{parseNotice}</span>
        </div>
      )}

      {/* Upload Mode Selector */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid #eaecf0', paddingBottom: 16, marginBottom: 20 }}>
          <button
            className={`btn ${uploadMode === 'single' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setUploadMode('single')}
          >
            <FileText size={16} />
            <span>Section 1: Single Job Upload</span>
          </button>
          <button
            className={`btn ${uploadMode === 'bulk' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setUploadMode('bulk')}
          >
            <Layers size={16} />
            <span>Section 2: Bulk Job Upload</span>
          </button>
        </div>

        {/* Section 1: Single Job Upload Dropzone */}
        {uploadMode === 'single' ? (
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
              Section 1: Single Job Requirement Upload
            </h3>
            <div
              className="dropzone"
              onClick={() => singleInputRef.current && singleInputRef.current.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleSingleSelect(e.dataTransfer.files[0]);
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className="dropzone-icon">
                <Upload size={24} />
              </div>
              <div>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                  Upload Single Job Description (PDF / DOCX)
                </span>
                <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                  Click to open native file picker or drag and drop file here (.pdf, .docx)
                </p>
              </div>
            </div>

            {singleFile && (
              <div style={{
                marginTop: 16,
                padding: '12px 16px',
                background: '#f8fafc',
                border: '1px solid #eaecf0',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FileText size={18} color="#2563eb" />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{singleFile.name}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      {(singleFile.size / 1024).toFixed(1)} KB • Ready for PDF/DOCX & Gemini AI Parsing
                    </div>
                  </div>
                </div>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: 12 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSingleFile(null);
                  }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Section 2: Bulk Job Upload Dropzone */
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
              Section 2: Bulk Job Requirement Upload
            </h3>
            <div
              className="dropzone"
              onClick={() => bulkInputRef.current && bulkInputRef.current.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files) {
                  handleBulkSelect(e.dataTransfer.files);
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className="dropzone-icon">
                <Layers size={24} />
              </div>
              <div>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                  Upload Multiple Job Requirements (PDF / DOCX)
                </span>
                <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                  Click to open native file picker or drag & drop multiple files (.pdf, .docx)
                </p>
              </div>
            </div>

            {bulkFiles.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 8 }}>
                  Selected Files ({bulkFiles.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {bulkFiles.map((f, i) => (
                    <div key={i} style={{
                      padding: '8px 14px',
                      background: '#f8fafc',
                      border: '1px solid #eaecf0',
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: 13
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileText size={16} color="#2563eb" />
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{f.name}</span>
                      </div>
                      <span style={{ color: '#64748b', fontSize: 12 }}>Batch File #{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI Analysis Trigger Button */}
        {!isAnalyzed && (
          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <button
              className="btn btn-primary"
              disabled={(uploadMode === 'single' ? !singleFile : bulkFiles.length === 0) || isAnalyzing}
              onClick={handleAnalyzeJD}
              style={{ opacity: (uploadMode === 'single' ? !singleFile : bulkFiles.length === 0) ? 0.5 : 1 }}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Parsing JD Text & Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Analyze Job Requirement</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* AI Analysis Result & Editable Fields Form */}
      {isAnalyzed && (
        <div className="card" style={{ padding: 28, marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, borderBottom: '1px solid #eaecf0', paddingBottom: 14 }}>
            <Sparkles size={20} color="#2563eb" />
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>AI Analysis Result</h2>
              <span style={{ fontSize: 13, color: '#64748b' }}>
                Auto-extracted parameters from uploaded JD document. All fields are editable before saving.
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmitSave}>
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Job Title *</label>
                <input
                  type="text"
                  className="form-input"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Shipgig Ventures"
                />
              </div>
            </div>

            {/* Renamed to Job Description */}
            <div className="form-group" style={{ marginTop: 16 }}>
              <label className="form-label">Job Description *</label>
              <textarea
                className="form-textarea"
                rows={6}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Exact extracted job description content..."
                required
              />
            </div>

            {/* Unified Single Required Skills Section */}
            <div className="form-group" style={{ marginTop: 16 }}>
              <label className="form-label">Required Skills (Comma separated) *</label>
              <input
                type="text"
                className="form-input"
                value={requiredSkillsInput}
                onChange={(e) => setRequiredSkillsInput(e.target.value)}
                placeholder="React, Node.js, Express, JavaScript, HTML, CSS, MongoDB, REST API, Git"
                required
              />
            </div>

            <div className="form-row-2" style={{ marginTop: 16 }}>
              <div className="form-group">
                <label className="form-label">Experience Required</label>
                <input
                  type="text"
                  className="form-input"
                  value={experienceRequired}
                  onChange={(e) => setExperienceRequired(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className="form-input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row-2" style={{ marginTop: 16 }}>
              <div className="form-group">
                <label className="form-label">Employment Type</label>
                <input
                  type="text"
                  className="form-input"
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Industry Type</label>
                <input
                  type="text"
                  className="form-input"
                  value={industryType}
                  onChange={(e) => setIndustryType(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row-2" style={{ marginTop: 16 }}>
              <div className="form-group">
                <label className="form-label">Department</label>
                <input
                  type="text"
                  className="form-input"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role Category</label>
                <input
                  type="text"
                  className="form-input"
                  value={roleCategory}
                  onChange={(e) => setRoleCategory(e.target.value)}
                />
              </div>
            </div>

            {/* Save Job CTA Button */}
            <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="button" className="btn btn-secondary" onClick={onBack}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <CheckCircle2 size={16} />
                <span>Save Job</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
