import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertReportSchema, insertEmergencySchema, insertFeedbackSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";

// Session configuration
const PgSession = connectPgSimple(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session({
    store: new PgSession({
      pool: pool,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  }));

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.session?.userId || req.session?.userRole !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  };

  // Auth Routes
  app.post('/api/v1/auth/register', async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const hashedPassword = await bcrypt.hash(data.password, 10);
      
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
      });

      req.session.userId = user.id;
      req.session.userRole = user.role;

      res.json({ user: { ...user, password: undefined } });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post('/api/v1/auth/login', async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(data.email);

      if (!user || !(await bcrypt.compare(data.password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      req.session.userId = user.id;
      req.session.userRole = user.role;

      res.json({ user: { ...user, password: undefined } });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get('/api/v1/auth/me', requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ user: { ...user, password: undefined } });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/v1/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Could not logout' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  // Report Routes
  app.post('/api/v1/report', requireAuth, async (req, res) => {
    try {
      const data = insertReportSchema.parse(req.body);
      const report = await storage.createReport({
        ...data,
        userId: req.session.userId,
      });
      res.json(report);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get('/api/v1/report/user', requireAuth, async (req, res) => {
    try {
      const reports = await storage.getUserReports(req.session.userId);
      res.json(reports);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/v1/report/:id', requireAuth, async (req, res) => {
    try {
      const report = await storage.getReportById(parseInt(req.params.id));
      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }
      res.json(report);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch('/api/v1/report/:id', requireAdmin, async (req, res) => {
    try {
      const { status, adminResponse } = req.body;
      const report = await storage.updateReportStatus(
        parseInt(req.params.id),
        status,
        adminResponse
      );
      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }
      res.json(report);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Emergency Routes
  app.post('/api/v1/emergency', requireAuth, async (req, res) => {
    try {
      const data = insertEmergencySchema.parse(req.body);
      const emergency = await storage.createEmergency({
        ...data,
        userId: req.session.userId,
      });
      res.json(emergency);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get('/api/v1/emergency/user', requireAuth, async (req, res) => {
    try {
      const emergencies = await storage.getUserEmergencies(req.session.userId);
      res.json(emergencies);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/v1/emergency/admin', requireAdmin, async (req, res) => {
    try {
      const emergencies = await storage.getActiveEmergencies();
      res.json(emergencies);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch('/api/v1/emergency/:id', requireAdmin, async (req, res) => {
    try {
      const { status, responseNotes } = req.body;
      const emergency = await storage.updateEmergencyStatus(
        parseInt(req.params.id),
        status,
        req.session.userId,
        responseNotes
      );
      if (!emergency) {
        return res.status(404).json({ message: 'Emergency not found' });
      }
      res.json(emergency);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Admin Routes
  app.get('/api/v1/admin/reports', requireAdmin, async (req, res) => {
    try {
      const reports = await storage.getAllReports();
      res.json(reports);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/v1/admin/emergencies', requireAdmin, async (req, res) => {
    try {
      const emergencies = await storage.getAllEmergencies();
      res.json(emergencies);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // History Routes
  app.get('/api/v1/history', requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      let history;
      if (user.role === 'admin') {
        history = await storage.getAdminHistory(user.id);
      } else {
        history = await storage.getUserHistory(user.id);
      }
      
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Feedback Routes
  app.post('/api/v1/feedback', requireAuth, async (req, res) => {
    try {
      const data = insertFeedbackSchema.parse(req.body);
      const feedback = await storage.createFeedback({
        ...data,
        userId: req.session.userId,
      });
      res.json(feedback);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get('/api/v1/feedback', requireAdmin, async (req, res) => {
    try {
      const feedback = await storage.getAllFeedback();
      res.json(feedback);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Profile Routes
  app.get('/api/v1/profile', requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ ...user, password: undefined });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch('/api/v1/profile', requireAuth, async (req, res) => {
    try {
      const { name, unitNumber, phoneNumber } = req.body;
      const updates: any = {};
      if (name) updates.name = name;
      if (unitNumber) updates.unitNumber = unitNumber;
      if (phoneNumber) updates.phoneNumber = phoneNumber;

      const user = await storage.updateUser(req.session.userId, updates);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ ...user, password: undefined });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
