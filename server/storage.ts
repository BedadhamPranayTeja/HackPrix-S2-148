import { 
  users, reports, emergencies, feedback,
  type User, type InsertUser, type LoginCredentials,
  type Report, type InsertReport,
  type Emergency, type InsertEmergency,
  type Feedback, type InsertFeedback
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;

  // Report operations
  createReport(report: InsertReport & { userId: number }): Promise<Report>;
  getUserReports(userId: number): Promise<Report[]>;
  getReportById(id: number): Promise<Report | undefined>;
  getAllReports(): Promise<Report[]>;
  updateReportStatus(id: number, status: string, adminResponse?: string): Promise<Report | undefined>;

  // Emergency operations
  createEmergency(emergency: InsertEmergency & { userId: number }): Promise<Emergency>;
  getUserEmergencies(userId: number): Promise<Emergency[]>;
  getActiveEmergencies(): Promise<Emergency[]>;
  getAllEmergencies(): Promise<Emergency[]>;
  updateEmergencyStatus(id: number, status: string, adminId?: number, responseNotes?: string): Promise<Emergency | undefined>;

  // Feedback operations
  createFeedback(feedback: InsertFeedback & { userId: number }): Promise<Feedback>;
  getAllFeedback(): Promise<Feedback[]>;

  // History operations
  getUserHistory(userId: number): Promise<{ reports: Report[], emergencies: Emergency[] }>;
  getAdminHistory(adminId: number): Promise<{ reports: Report[], emergencies: Emergency[] }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async createReport(report: InsertReport & { userId: number }): Promise<Report> {
    const [newReport] = await db
      .insert(reports)
      .values(report)
      .returning();
    return newReport;
  }

  async getUserReports(userId: number): Promise<Report[]> {
    return await db
      .select()
      .from(reports)
      .where(eq(reports.userId, userId))
      .orderBy(desc(reports.createdAt));
  }

  async getReportById(id: number): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report || undefined;
  }

  async getAllReports(): Promise<Report[]> {
    return await db
      .select()
      .from(reports)
      .orderBy(desc(reports.createdAt));
  }

  async updateReportStatus(id: number, status: string, adminResponse?: string): Promise<Report | undefined> {
    const updates: any = { status, updatedAt: new Date() };
    if (adminResponse) updates.adminResponse = adminResponse;
    
    const [report] = await db
      .update(reports)
      .set(updates)
      .where(eq(reports.id, id))
      .returning();
    return report || undefined;
  }

  async createEmergency(emergency: InsertEmergency & { userId: number }): Promise<Emergency> {
    const [newEmergency] = await db
      .insert(emergencies)
      .values(emergency)
      .returning();
    return newEmergency;
  }

  async getUserEmergencies(userId: number): Promise<Emergency[]> {
    return await db
      .select()
      .from(emergencies)
      .where(eq(emergencies.userId, userId))
      .orderBy(desc(emergencies.createdAt));
  }

  async getActiveEmergencies(): Promise<Emergency[]> {
    return await db
      .select()
      .from(emergencies)
      .where(eq(emergencies.status, "active"))
      .orderBy(desc(emergencies.createdAt));
  }

  async getAllEmergencies(): Promise<Emergency[]> {
    return await db
      .select()
      .from(emergencies)
      .orderBy(desc(emergencies.createdAt));
  }

  async updateEmergencyStatus(id: number, status: string, adminId?: number, responseNotes?: string): Promise<Emergency | undefined> {
    const updates: any = { status };
    if (adminId) updates.adminId = adminId;
    if (responseNotes) updates.responseNotes = responseNotes;
    if (status === 'resolved') updates.resolvedAt = new Date();

    const [emergency] = await db
      .update(emergencies)
      .set(updates)
      .where(eq(emergencies.id, id))
      .returning();
    return emergency || undefined;
  }

  async createFeedback(feedback: InsertFeedback & { userId: number }): Promise<Feedback> {
    const [newFeedback] = await db
      .insert(feedback)
      .values(feedback)
      .returning();
    return newFeedback;
  }

  async getAllFeedback(): Promise<Feedback[]> {
    return await db
      .select()
      .from(feedback)
      .orderBy(desc(feedback.submittedAt));
  }

  async getUserHistory(userId: number): Promise<{ reports: Report[], emergencies: Emergency[] }> {
    const userReports = await this.getUserReports(userId);
    const userEmergencies = await this.getUserEmergencies(userId);
    return { reports: userReports, emergencies: userEmergencies };
  }

  async getAdminHistory(adminId: number): Promise<{ reports: Report[], emergencies: Emergency[] }> {
    const adminReports = await db
      .select()
      .from(reports)
      .where(eq(reports.status, "approved"))
      .orderBy(desc(reports.updatedAt));
    
    const adminEmergencies = await db
      .select()
      .from(emergencies)
      .where(eq(emergencies.adminId, adminId))
      .orderBy(desc(emergencies.createdAt));
    
    return { reports: adminReports, emergencies: adminEmergencies };
  }
}

export const storage = new DatabaseStorage();
