import { pgTable, uuid, varchar, timestamp, text, integer, numeric, boolean, uniqueIndex, unique, index } from 'drizzle-orm/pg-core';

// 1. Agencies (Tenants)
export const agencies = pgTable('agencies', {
  agencyId: uuid('agency_id').defaultRandom().primaryKey(),
  agencyName: varchar('agency_name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// 2. Users (Recruiters, Owners, Admins)
export const users = pgTable('users', {
  userId: uuid('user_id').defaultRandom().primaryKey(),
  agencyId: uuid('agency_id')
    .notNull()
    .references(() => agencies.agencyId, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).unique().notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).default('recruiter').notNull(), // 'owner' | 'recruiter' | 'finance' | 'admin'
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// 3. Client Records
export const clientRecords = pgTable('client_records', {
  clientId: uuid('client_id').defaultRandom().primaryKey(),
  agencyId: uuid('agency_id')
    .notNull()
    .references(() => agencies.agencyId, { onDelete: 'cascade' }),
  companyName: varchar('company_name', { length: 255 }).notNull(),
  primaryHrName: varchar('primary_hr_name', { length: 255 }).notNull(),
  primaryHrEmail: varchar('primary_hr_email', { length: 255 }).notNull(),
  primaryHrPhone: varchar('primary_hr_phone', { length: 50 }).notNull(),
  agreedFeePercentage: numeric('agreed_fee_percentage', { precision: 5, scale: 2 }).default('8.33'),
  billingAddress: text('billing_address'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  clientCompanyIdx: index('idx_client_company').on(t.agencyId, t.companyName),
  clientEmailIdx: index('idx_client_email').on(t.agencyId, t.primaryHrEmail),
}));

// 4. Candidate Records
export const candidateRecords = pgTable('candidate_records', {
  candidateId: uuid('candidate_id').defaultRandom().primaryKey(),
  agencyId: uuid('agency_id')
    .notNull()
    .references(() => agencies.agencyId, { onDelete: 'cascade' }),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }), // E.164 format, e.g. +919876543210
  currentCompany: varchar('current_company', { length: 255 }),
  currentTitle: varchar('current_title', { length: 255 }),
  skills: text('skills').array(),
  totalExpMonths: integer('total_exp_months'),
  noticePeriodDays: integer('notice_period_days'),
  currentCtc: numeric('current_ctc', { precision: 12, scale: 2 }),
  expectedCtc: numeric('expected_ctc', { precision: 12, scale: 2 }),
  resumeUrl: text('resume_url'),
  sanitizedCvUrl: text('sanitized_cv_url'),
  currentLocation: varchar('current_location', { length: 255 }),
  tags: text('tags').array(),
  sourceType: varchar('source_type', { length: 50 }).default('Direct_Upload'), // 'Direct_Upload', 'Partner_Vault', 'Job_Board'
  sourcePartnerEmail: varchar('source_partner_email', { length: 255 }),
  lastActivityAt: timestamp('last_activity_at', { withTimezone: true }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  agencyPhoneIdx: index('idx_candidate_phone').on(t.agencyId, t.phone),
  agencyEmailIdx: index('idx_candidate_email').on(t.agencyId, t.email),
}));

// 4.1 Candidate Relational Links
export const candidateRelationalLinks = pgTable('candidate_relational_links', {
  linkId: uuid('link_id').defaultRandom().primaryKey(),
  primaryCandidateId: uuid('primary_candidate_id')
    .notNull()
    .references(() => candidateRecords.candidateId, { onDelete: 'cascade' }),
  relatedCandidateId: uuid('related_candidate_id')
    .notNull()
    .references(() => candidateRecords.candidateId, { onDelete: 'cascade' }),
  relationshipType: varchar('relationship_type', { length: 50 }).notNull(), // 'SPOUSE' | 'COLLEAGUE' | 'REFERRAL'
  inheritedTargetLocation: varchar('inherited_target_location', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  idxPrimaryCand: index('idx_primary_cand_link').on(t.primaryCandidateId),
  idxRelatedCand: index('idx_related_cand_link').on(t.relatedCandidateId),
}));

// 5. Job Mandates
export const jobMandates = pgTable('job_mandates', {
  jobId: uuid('job_id').defaultRandom().primaryKey(),
  agencyId: uuid('agency_id')
    .notNull()
    .references(() => agencies.agencyId, { onDelete: 'cascade' }),
  clientId: uuid('client_id').references(() => clientRecords.clientId, { onDelete: 'cascade' }),
  assignedRecruiterId: uuid('assigned_recruiter_id').references(() => users.userId),
  title: varchar('title', { length: 255 }).notNull(),
  clientName: varchar('client_name', { length: 255 }),
  primaryHrName: varchar('primary_hr_name', { length: 255 }),
  primaryHrEmail: varchar('primary_hr_email', { length: 255 }),
  primaryHrPhone: varchar('primary_hr_phone', { length: 50 }),
  selectedTerms: varchar('selected_terms', { length: 255 }),
  targetLocation: varchar('target_location', { length: 255 }),
  minExpYears: integer('min_exp_years').default(0),
  maxExpYears: integer('max_exp_years'),
  minFixedCtc: numeric('min_fixed_ctc', { precision: 12, scale: 2 }),
  maxFixedCtc: numeric('max_fixed_ctc', { precision: 12, scale: 2 }),
  openPositions: integer('open_positions').default(1),
  slaDeadline: timestamp('sla_deadline', { withTimezone: true }),
  status: varchar('status', { length: 50 }).default('Unreviewed Inbound'), // 'Unreviewed Inbound', 'Active', 'On Hold', 'Closed'
  stageUpdatedAt: timestamp('stage_updated_at', { withTimezone: true }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// 5. Unified Communication Log
export const communicationLog = pgTable('communication_log', {
  messageId: uuid('message_id').defaultRandom().primaryKey(),
  agencyId: uuid('agency_id')
    .notNull()
    .references(() => agencies.agencyId, { onDelete: 'cascade' }),
  submissionId: uuid('submission_id')
    .references(() => candidateSubmissions.submissionId, { onDelete: 'cascade' }),
  candidateId: uuid('candidate_id')
    .references(() => candidateRecords.candidateId, { onDelete: 'set null' }),
  sentByUserId: uuid('sent_by_user_id')
    .references(() => users.userId, { onDelete: 'set null' }),
  channel: varchar('channel', { length: 20 }).notNull(), // 'WHATSAPP' | 'EMAIL' | 'SYSTEM_NOTE'
  direction: varchar('direction', { length: 10 }).notNull(), // 'INBOUND' | 'OUTBOUND'
  fromAddress: varchar('from_address', { length: 255 }), // sender's phone or email
  toAddress: varchar('to_address', { length: 255 }), // recipient's phone or email
  body: text('body'),
  externalMessageId: varchar('external_message_id', { length: 255 }),
  status: varchar('status', { length: 20 }).default('sent'), // 'sent' | 'delivered' | 'read' | 'failed' | 'received'
  matched: boolean('matched').default(true), // false = unlinked lead
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  commCandidateIdx: index('idx_comm_candidate').on(t.agencyId, t.candidateId, t.createdAt),
  commSubmissionIdx: index('idx_comm_submission').on(t.submissionId),
  commUnmatchedIdx: index('idx_comm_unmatched').on(t.agencyId, t.matched),
}));

// 6. Agency Channels
export const agencyChannels = pgTable('agency_channels', {
  channelId: uuid('channel_id').defaultRandom().primaryKey(),
  agencyId: uuid('agency_id')
    .notNull()
    .references(() => agencies.agencyId, { onDelete: 'cascade' }),
  channel: varchar('channel', { length: 20 }).notNull(), // 'whatsapp' | 'email'
  address: varchar('address', { length: 255 }).notNull(), // registered number/email
}, (t) => ({
  unqChannelAddress: unique('unq_channel_address').on(t.channel, t.address),
}));

// 7. Agency Storefront Profiles
export const agencyStorefrontProfiles = pgTable('agency_storefront_profiles', {
  storefrontId: uuid('storefront_id').defaultRandom().primaryKey(),
  agencyId: uuid('agency_id')
    .notNull()
    .unique()
    .references(() => agencies.agencyId, { onDelete: 'cascade' }),
  subdomain: varchar('subdomain', { length: 100 }).notNull().unique(),
  customDomain: varchar('custom_domain', { length: 255 }).unique(),
  brandLogoUrl: varchar('brand_logo_url', { length: 512 }),
  primaryColor: varchar('primary_color', { length: 7 }).default('#0F172A').notNull(),
  accentColor: varchar('accent_color', { length: 7 }).default('#FFD400').notNull(),
  heroHeadline: varchar('hero_headline', { length: 255 }).default('Bespoke Executive Search & Talent Infrastructure').notNull(),
  aboutText: text('about_text'),
  featuredSpecializations: text('featured_specializations').array(), // list of areas (e.g. Fintech, Executive Leadership)
  showMetricsBar: boolean('show_metrics_bar').default(true).notNull(),
  isPublished: boolean('is_published').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  subdomainIdx: index('idx_storefront_subdomain').on(t.subdomain),
}));

// 8. Inbound Client Mandates
export const inboundClientMandates = pgTable('inbound_client_mandates', {
  inboundId: uuid('inbound_id').defaultRandom().primaryKey(),
  agencyId: uuid('agency_id')
    .notNull()
    .references(() => agencies.agencyId, { onDelete: 'cascade' }),
  companyName: varchar('company_name', { length: 255 }).notNull(),
  contactName: varchar('contact_name', { length: 255 }).notNull(),
  contactEmail: varchar('contact_email', { length: 255 }).notNull(),
  contactPhone: varchar('contact_phone', { length: 50 }).notNull(),
  jobTitle: varchar('job_title', { length: 255 }).notNull(),
  targetLocation: varchar('target_location', { length: 255 }).notNull(),
  minBudget: numeric('min_budget', { precision: 12, scale: 2 }),
  maxBudget: numeric('max_budget', { precision: 12, scale: 2 }),
  selectedTermType: varchar('selected_term_type', { length: 50 }).default('Standard Contingency').notNull(),
  rawJdUrl: varchar('raw_jd_url', { length: 512 }),
  status: varchar('status', { length: 50 }).default('Pending Agency Review').notNull(), // 'Pending Agency Review' | 'Accepted Mandate' | 'Declined Terms Mismatch'
  convertedJobId: uuid('converted_job_id').references(() => jobMandates.jobId),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  inboundAgencyIdx: index('idx_inbound_agency').on(t.agencyId),
}));

// 9. Candidate Submissions (Pipeline Tracking)
export const candidateSubmissions = pgTable('candidate_submissions', {
  submissionId: uuid('submission_id').defaultRandom().primaryKey(),
  agencyId: uuid('agency_id')
    .notNull()
    .references(() => agencies.agencyId, { onDelete: 'cascade' }),
  jobId: uuid('job_id')
    .notNull()
    .references(() => jobMandates.jobId, { onDelete: 'cascade' }),
  candidateId: uuid('candidate_id')
    .notNull()
    .references(() => candidateRecords.candidateId, { onDelete: 'cascade' }),
  sourceShareId: uuid('source_share_id').references(() => partnerMandateShares.shareId, { onDelete: 'set null' }),
  stage: varchar('stage', { length: 50 }).default('Screened').notNull(), // 'Screened' | 'Submitted' | 'Interviewing' | 'Offered' | 'Joined' | 'Rejected'
  riskStatus: varchar('risk_status', { length: 50 }).default('NORMAL').notNull(), // 'NORMAL' | 'HIGH_RISK'
  riskReason: text('risk_reason'),
  rejectionReason: text('rejection_reason'),
  stageUpdatedAt: timestamp('stage_updated_at', { withTimezone: true }).defaultNow(),
  lastCommunicationAt: timestamp('last_communication_at', { withTimezone: true }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  subAgencyIdx: index('idx_sub_agency').on(t.agencyId),
  subJobIdx: index('idx_sub_job').on(t.jobId),
  subCandidateIdx: index('idx_sub_candidate').on(t.candidateId),
}));

// 10. Agency Job Board Credentials
export const agencyJobBoardCredentials = pgTable('agency_job_board_credentials', {
  credentialId: uuid('credential_id').defaultRandom().primaryKey(),
  agencyId: uuid('agency_id')
    .notNull()
    .references(() => agencies.agencyId, { onDelete: 'cascade' }),
  boardName: varchar('board_name', { length: 50 }).notNull(), // 'Naukri' | 'Bayt' | 'LinkedIn'
  apiKey: text('api_key'),
  oauthToken: text('oauth_token'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  idxCredentialsAgency: index('idx_credentials_agency').on(t.agencyId),
}));

// 11. Job Board Postings
export const jobBoardPostings = pgTable('job_board_postings', {
  postingId: uuid('posting_id').defaultRandom().primaryKey(),
  jobId: uuid('job_id')
    .notNull()
    .references(() => jobMandates.jobId, { onDelete: 'cascade' }),
  boardName: varchar('board_name', { length: 50 }).notNull(), // 'Naukri' | 'Bayt' | 'LinkedIn'
  externalJobId: varchar('external_job_id', { length: 255 }).notNull(),
  postingStatus: varchar('posting_status', { length: 50 }).default('Published').notNull(),
  applicationsCount: integer('applications_count').default(0).notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  idxBoardPostingJob: index('idx_board_posting_job').on(t.jobId),
}));

// 12. Partner Mandate Shares
export const partnerMandateShares = pgTable('partner_mandate_shares', {
  shareId: uuid('share_id').defaultRandom().primaryKey(),
  agencyId: uuid('agency_id')
    .notNull()
    .references(() => agencies.agencyId, { onDelete: 'cascade' }),
  jobId: uuid('job_id')
    .notNull()
    .references(() => jobMandates.jobId, { onDelete: 'cascade' }),
  partnerEmail: varchar('partner_email', { length: 255 }).notNull(),
  partnerName: varchar('partner_name', { length: 255 }),
  maskedJobTitle: varchar('masked_job_title', { length: 255 }).notNull(),
  maskedCompanyDescription: text('masked_company_description').notNull(),
  agencySplitPercentage: numeric('agency_split_percentage', { precision: 5, scale: 2 }).default('50.00'),
  partnerSplitPercentage: numeric('partner_split_percentage', { precision: 5, scale: 2 }).default('50.00'),
  accessTokenHash: varchar('access_token_hash', { length: 64 }).unique().notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  idxPartnerToken: index('idx_partner_token').on(t.accessTokenHash),
}));

// 13. Storefront Candidate Applications
export const storefrontCandidateApplications = pgTable('storefront_candidate_applications', {
  applicationId: uuid('application_id').defaultRandom().primaryKey(),
  agencyId: uuid('agency_id')
    .notNull()
    .references(() => agencies.agencyId, { onDelete: 'cascade' }),
  candidateId: uuid('candidate_id')
    .notNull()
    .references(() => candidateRecords.candidateId, { onDelete: 'cascade' }),
  sourceChannel: varchar('source_channel', { length: 50 }).default('Storefront_Direct').notNull(),
  parsedSuccessfully: boolean('parsed_successfully').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  idxStorefrontCandAgency: index('idx_storefront_cand_agency').on(t.agencyId),
}));

// 14. Client Portal Access Tokens (Zero-Login Shortlist Review)
export const clientPortalTokens = pgTable('client_portal_tokens', {
  tokenId: uuid('token_id').defaultRandom().primaryKey(),
  agencyId: uuid('agency_id')
    .notNull()
    .references(() => agencies.agencyId, { onDelete: 'cascade' }),
  jobId: uuid('job_id')
    .notNull()
    .references(() => jobMandates.jobId, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 64 }).unique().notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  idxClientPortalTokenHash: index('idx_client_portal_token_hash').on(t.tokenHash),
  idxClientPortalTokenJob: index('idx_client_portal_token_job').on(t.jobId),
}));

// 15. Proposed Interview Slots (Client Drop 3 Slots & Candidate Selection)
export const proposedInterviewSlots = pgTable('proposed_interview_slots', {
  slotId: uuid('slot_id').defaultRandom().primaryKey(),
  submissionId: uuid('submission_id')
    .notNull()
    .references(() => candidateSubmissions.submissionId, { onDelete: 'cascade' }),
  interviewerEmail: varchar('interviewer_email', { length: 255 }).notNull(),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  status: varchar('status', { length: 30 }).default('Proposed').notNull(), // 'Proposed', 'Accepted', 'RejectedByCandidate'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  idxProposedSlotsSub: index('idx_proposed_slots_sub').on(t.submissionId),
}));

// 16. Interview Schedules (Workflow 5: Stage-Gate & Prep Tracking)
export const interviewSchedules = pgTable('interview_schedules', {
  interviewId: uuid('interview_id').defaultRandom().primaryKey(),
  submissionId: uuid('submission_id')
    .notNull()
    .references(() => candidateSubmissions.submissionId, { onDelete: 'cascade' }),
  confirmedSlotId: uuid('confirmed_slot_id').references(() => proposedInterviewSlots.slotId, { onDelete: 'set null' }),
  meetingLink: varchar('meeting_link', { length: 512 }),
  outcomeStatus: varchar('outcome_status', { length: 50 }).default('Scheduled').notNull(), // 'Scheduled', 'Completed', 'Rescheduled', 'No_Show', 'Rejected_Post_Interview'
  candidatePrepAcknowledged: boolean('candidate_prep_acknowledged').default(false).notNull(),
  prepToken: varchar('prep_token', { length: 64 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  idxInterviewScheduleSub: index('idx_interview_schedule_sub').on(t.submissionId),
}));

// 17. Interview Debriefs (Post-Interview Candidate Survey & Voice Notes)
export const interviewDebriefs = pgTable('interview_debriefs', {
  debriefId: uuid('debrief_id').defaultRandom().primaryKey(),
  interviewId: uuid('interview_id')
    .notNull()
    .references(() => interviewSchedules.interviewId, { onDelete: 'cascade' }),
  rating: integer('rating'), // 1 to 5
  interestLevel: varchar('interest_level', { length: 50 }).notNull(), // '100% Excited', 'Have Doubts', 'Not Interested'
  candidateNotes: text('candidate_notes'),
  voiceNoteUrl: varchar('voice_note_url', { length: 512 }),
  submittedAt: timestamp('submitted_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  idxDebriefInterview: index('idx_debrief_interview').on(t.interviewId),
}));








