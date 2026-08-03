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

// 3. Candidate Records
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
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  agencyPhoneIdx: index('idx_candidate_phone').on(t.agencyId, t.phone),
  agencyEmailIdx: index('idx_candidate_email').on(t.agencyId, t.email),
}));

// 4. Job Mandates
export const jobMandates = pgTable('job_mandates', {
  jobId: uuid('job_id').defaultRandom().primaryKey(),
  agencyId: uuid('agency_id')
    .notNull()
    .references(() => agencies.agencyId, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  clientName: varchar('client_name', { length: 255 }),
  status: varchar('status', { length: 50 }).default('Open'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// 5. Unified Communication Log
export const communicationLog = pgTable('communication_log', {
  messageId: uuid('message_id').defaultRandom().primaryKey(),
  agencyId: uuid('agency_id')
    .notNull()
    .references(() => agencies.agencyId, { onDelete: 'cascade' }),
  candidateId: uuid('candidate_id')
    .references(() => candidateRecords.candidateId, { onDelete: 'set null' }),
  channel: varchar('channel', { length: 20 }).notNull(), // 'whatsapp' | 'email'
  direction: varchar('direction', { length: 10 }).notNull(), // 'inbound' | 'outbound'
  fromAddress: varchar('from_address', { length: 255 }), // sender's phone or email
  toAddress: varchar('to_address', { length: 255 }), // recipient's phone or email
  body: text('body'),
  externalMessageId: varchar('external_message_id', { length: 255 }),
  status: varchar('status', { length: 20 }).default('sent'), // 'sent' | 'delivered' | 'read' | 'failed' | 'received'
  matched: boolean('matched').default(true), // false = unlinked lead
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  commCandidateIdx: index('idx_comm_candidate').on(t.agencyId, t.candidateId, t.createdAt),
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
