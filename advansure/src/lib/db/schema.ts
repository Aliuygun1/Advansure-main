/**
 * Drizzle ORM Schema — Advansure PostgreSQL
 *
 * Circular reference note: conversations and walks reference claims (nullable FK),
 * while claims references policies which references personas.
 * We use () => table lazy references in Drizzle to break the circular dependency.
 */

import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

// ---------------------------------------------------------------------------
// personas
// ---------------------------------------------------------------------------
export const personas = pgTable('personas', {
  id: text('id').primaryKey(), // 'leon' | 'robert' | 'julia'
  name: text('name').notNull(), // Vorname
  full_name: text('full_name').notNull(),
  initials: text('initials').notNull(),
  tenure: text('tenure').notNull(), // z.B. 'Kunde seit 2022'
  created_at: timestamp('created_at').defaultNow(),
});

// ---------------------------------------------------------------------------
// policies
// ---------------------------------------------------------------------------
export const policies = pgTable('policies', {
  id: uuid('id').primaryKey().defaultRandom(),
  persona_id: text('persona_id')
    .notNull()
    .references(() => personas.id, { onDelete: 'cascade' }),
  living_area_m2: integer('living_area_m2').notNull(),
  sum_insured: integer('sum_insured').notNull(), // in €
  address: text('address').notNull(),
  policy_no: text('policy_no').notNull().unique(),
  active: boolean('active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow(),
});

// ---------------------------------------------------------------------------
// claims — declared before conversations/walks so they can reference it,
// but the FK back from claims → policies is fine (no circular at this level)
// ---------------------------------------------------------------------------
export const claims = pgTable('claims', {
  id: uuid('id').primaryKey().defaultRandom(),
  persona_id: text('persona_id')
    .notNull()
    .references(() => personas.id),
  policy_id: uuid('policy_id')
    .notNull()
    .references(() => policies.id),
  damage_type: text('damage_type').notNull(), // 'wasser' | 'feuer' | 'einbruch' | 'sturm'
  cause: text('cause').notNull(),
  status: text('status').notNull().default('eingegangen'), // 'eingegangen' | 'bearbeitung' | 'geprueft' | 'abgeschlossen'
  vorgangsnummer: text('vorgangsnummer').unique(), // nullable until submit, then e.g. 'ADV-2026-0001'
  total_amount: integer('total_amount').notNull().default(0),
  created_at: timestamp('created_at').defaultNow(),
});

// ---------------------------------------------------------------------------
// conversations — claim_id nullable FK (lazy reference to break potential
// forward-reference issues during module initialisation)
// ---------------------------------------------------------------------------
export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  // TU-02: claim_id may be null until a claim is created
  claim_id: uuid('claim_id').references(() => claims.id, {
    onDelete: 'set null',
  }),
  persona_id: text('persona_id')
    .notNull()
    .references(() => personas.id),
  role: text('role').notNull(), // 'user' | 'avery'
  content: text('content').notNull(),
  // intent: { damage_type?: string; cause?: string } — TU-02 intent extraction
  intent: jsonb('intent'),
  created_at: timestamp('created_at').defaultNow(),
});

// ---------------------------------------------------------------------------
// walks — claim_id nullable FK (lazy)
// ---------------------------------------------------------------------------
export const walks = pgTable('walks', {
  id: uuid('id').primaryKey().defaultRandom(),
  // TU-03/04: claim_id nullable until walk is linked to a submitted claim
  claim_id: uuid('claim_id').references(() => claims.id, {
    onDelete: 'set null',
  }),
  persona_id: text('persona_id')
    .notNull()
    .references(() => personas.id),
  status: text('status').notNull().default('active'), // 'active' | 'cancelled' | 'completed' | 'error_external_api'
  iteration_count: integer('iteration_count').notNull().default(0),
  created_at: timestamp('created_at').defaultNow(),
});

// ---------------------------------------------------------------------------
// rooms — child of walk; TU-04/05 valuation result per room
// ---------------------------------------------------------------------------
export const rooms = pgTable('rooms', {
  id: uuid('id').primaryKey().defaultRandom(),
  walk_id: uuid('walk_id')
    .notNull()
    .references(() => walks.id, { onDelete: 'cascade' }),
  room_type: text('room_type').notNull(), // z.B. 'Küche', 'Bad', 'Wohnzimmer'
  damage_grade: text('damage_grade').notNull(), // 'leicht' | 'mittel' | 'schwer' | 'total' | 'nicht einschätzbar'
  damage_kind: text('damage_kind').notNull(),
  video_url: text('video_url'), // nullable; set after TU-03 upload
  satisfied: boolean('satisfied').notNull().default(false),
  area_m2: integer('area_m2').notNull(),
  rate_per_m2: integer('rate_per_m2').notNull(),
  amount: integer('amount').notNull(), // area_m2 × rate_per_m2
  ai_reasoning: text('ai_reasoning'), // nullable; from Gemini vision response
  created_at: timestamp('created_at').defaultNow(),
});

// ---------------------------------------------------------------------------
// audit_logs — every API request/response pair; TU-01…06
// ---------------------------------------------------------------------------
export const audit_logs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  endpoint: text('endpoint').notNull(),
  request_hash: text('request_hash'), // nullable; SHA-256 of request body
  response_hash: text('response_hash'), // nullable; SHA-256 of response body
  persona_id: text('persona_id'), // nullable; not a FK to keep log intact after persona deletion
  created_at: timestamp('created_at').defaultNow(),
});

// ---------------------------------------------------------------------------
// Type exports — inferred from schema for use in the application layer
// ---------------------------------------------------------------------------
export type Persona = typeof personas.$inferSelect;
export type NewPersona = typeof personas.$inferInsert;

export type Policy = typeof policies.$inferSelect;
export type NewPolicy = typeof policies.$inferInsert;

export type Claim = typeof claims.$inferSelect;
export type NewClaim = typeof claims.$inferInsert;

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;

export type Walk = typeof walks.$inferSelect;
export type NewWalk = typeof walks.$inferInsert;

export type Room = typeof rooms.$inferSelect;
export type NewRoom = typeof rooms.$inferInsert;

export type AuditLog = typeof audit_logs.$inferSelect;
export type NewAuditLog = typeof audit_logs.$inferInsert;
