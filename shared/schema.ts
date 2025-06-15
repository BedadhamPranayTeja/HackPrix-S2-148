import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("user"), // 'user' | 'admin'
  unitNumber: text("unit_number"),
  phoneNumber: text("phone_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  category: varchar("category", { length: 50 }).notNull(), // 'theft', 'assault', 'vandalism', etc.
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  evidenceUrl: text("evidence_url"), // photo/video URL
  victimName: text("victim_name"),
  victimContact: text("victim_contact"),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // 'pending', 'approved', 'resolved', 'denied'
  adminResponse: text("admin_response"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const emergencies = pgTable("emergencies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(), // 'fire', 'accident', 'violence', 'medical'
  location: text("location").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("active"), // 'active', 'responded', 'resolved'
  adminId: integer("admin_id").references(() => users.id),
  responseNotes: text("response_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  rating: integer("rating"), // 1-5 star rating
  category: varchar("category", { length: 50 }), // 'service', 'app', 'security', etc.
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  reports: many(reports),
  emergencies: many(emergencies),
  feedback: many(feedback),
  adminEmergencies: many(emergencies, { relationName: "adminEmergencies" }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  user: one(users, {
    fields: [reports.userId],
    references: [users.id],
  }),
}));

export const emergenciesRelations = relations(emergencies, ({ one }) => ({
  user: one(users, {
    fields: [emergencies.userId],
    references: [users.id],
  }),
  admin: one(users, {
    fields: [emergencies.adminId],
    references: [users.id],
    relationName: "adminEmergencies",
  }),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  user: one(users, {
    fields: [feedback.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmergencySchema = createInsertSchema(emergencies).omit({
  id: true,
  userId: true,
  createdAt: true,
  resolvedAt: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  userId: true,
  submittedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

export type Emergency = typeof emergencies.$inferSelect;
export type InsertEmergency = z.infer<typeof insertEmergencySchema>;

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
