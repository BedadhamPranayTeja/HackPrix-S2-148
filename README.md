# SecureGate Community Security App

## Overview

SecureGate is a comprehensive community security management application designed for residential communities like Sunset Heights. The system provides a mobile-first interface for residents to report incidents, request emergency assistance, and communicate with security personnel. Administrators can manage reports, respond to emergencies, and monitor community security activities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state, React Context for authentication
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Express sessions with PostgreSQL session store
- **Password Security**: Bcrypt for password hashing
- **Development**: tsx for TypeScript execution in development

## Key Components

### Authentication System
- Session-based authentication using express-session
- PostgreSQL session storage via connect-pg-simple
- Role-based access control (user/admin roles)
- Protected routes with automatic redirection

### Database Schema
- **Users**: Core user information with roles and contact details
- **Reports**: Incident reports with categorization and status tracking
- **Emergencies**: Emergency requests with response tracking
- **Feedback**: Community feedback with rating system

### Mobile-First UI
- Responsive design optimized for mobile devices
- Bottom navigation for easy thumb navigation
- Card-based layout for content organization
- Emergency button prominently featured

## Data Flow

1. **Authentication Flow**: Users log in through the login page, creating a session stored in PostgreSQL
2. **Report Submission**: Residents create incident reports with photos, location, and details
3. **Emergency Requests**: One-tap emergency button creates urgent requests for admin response
4. **Admin Management**: Administrators review and respond to reports and emergencies
5. **Real-time Updates**: React Query handles data synchronization and caching

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection with WebSocket support
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI primitives
- **wouter**: Lightweight routing
- **react-hook-form**: Form handling
- **zod**: Schema validation

### Development Tools
- **typescript**: Static type checking
- **tailwindcss**: Utility-first CSS framework
- **vite**: Fast build tool and dev server
- **tsx**: TypeScript execution

## Deployment Strategy

### Development Environment
- Replit-optimized configuration with Node.js 20
- PostgreSQL 16 database provisioning
- Hot module replacement for fast development
- Port 5000 for local development

### Production Build
- Vite builds the frontend to `dist/public`
- esbuild bundles the server code to `dist/index.js`
- Single deployment artifact with static file serving
- Environment-based configuration

### Database Management
- Drizzle migrations in `./migrations` directory
- Schema definitions in `shared/schema.ts`
- Environment variable configuration for database connection

## Changelog

```
Changelog:
- June 15, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```
