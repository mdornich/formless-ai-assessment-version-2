# Technical Architecture - Formless AI Assessment Platform

## Overview

The Formless AI Assessment Platform is a conversational assessment system that uses AI agents to conduct dynamic interviews and generate personalized reports. The architecture is designed for scalability, maintainability, and ease of deployment.

## High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Entry    │───▶│   Frontend      │───▶│   Backend       │
│  (Web/SMS/Email)│    │   (React App)   │    │   (Node.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                       ┌─────────────────┐            │
                       │   Supabase      │◀───────────┘
                       │ (Auth + DB)     │
                       └─────────────────┘
                                │
        ┌──────────────────────────┼──────────────────────────┐
        │                         │                          │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   LLM Provider  │    │   Workflow      │    │   External      │
│ (OpenAI/Claude) │    │   Engine        │    │   Services      │
│                 │    │                 │    │   (Twilio)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Component Details

### 1. Frontend (React Web Application)

**Technology Stack:**
- React 18+ with TypeScript
- Next.js for SSR and routing
- Tailwind CSS for styling
- React Query for state management and caching
- Socket.io-client for real-time messaging

**Key Features:**
- Responsive conversational UI
- Real-time message updates
- Loading states and error handling
- Mobile-optimized interface
- Session token-based authentication

**File Structure:**
```
src/frontend/
├── components/
│   ├── Chat/
│   │   ├── ChatInterface.tsx
│   │   ├── MessageBubble.tsx
│   │   └── InputField.tsx
│   ├── Assessment/
│   │   ├── AssessmentStart.tsx
│   │   └── AssessmentComplete.tsx
│   └── Common/
│       ├── Loading.tsx
│       └── ErrorBoundary.tsx
├── pages/
│   ├── assessment/[token].tsx
│   └── api/
├── hooks/
│   ├── useAssessment.ts
│   └── useSocket.ts
├── utils/
│   ├── api.ts
│   └── constants.ts
└── styles/
    └── globals.css
```

### 2. Backend (Node.js + Express)

**Technology Stack:**
- Node.js with TypeScript
- Express.js for API routes
- Socket.io for real-time communication
- Supabase client for database operations
- OpenAI/Anthropic SDK for LLM integration
- Bull/Agenda for job queuing

**Key Services:**
- **Assessment Controller**: Manages conversation flow
- **LLM Service**: Handles AI agent interactions
- **Report Generator**: Creates final assessment reports
- **Notification Service**: Manages external communications
- **Session Manager**: Handles tokenized access

**File Structure:**
```
src/backend/
├── controllers/
│   ├── assessmentController.ts
│   ├── messageController.ts
│   └── reportController.ts
├── services/
│   ├── llmService.ts
│   ├── reportService.ts
│   ├── notificationService.ts
│   └── supabaseService.ts
├── middleware/
│   ├── auth.ts
│   ├── validation.ts
│   └── rateLimit.ts
├── models/
│   ├── Assessment.ts
│   ├── Conversation.ts
│   └── Message.ts
├── workers/
│   ├── reportGenerator.ts
│   └── notificationWorker.ts
├── utils/
│   ├── prompts.ts
│   ├── tokenGenerator.ts
│   └── errorHandler.ts
└── routes/
    ├── assessment.ts
    ├── messages.ts
    └── reports.ts
```

### 3. Database (Supabase/PostgreSQL)

**Key Features:**
- Row-level security (RLS) for data isolation
- Real-time subscriptions for live updates
- Built-in authentication and user management
- Automatic API generation
- Edge functions for serverless compute

**Data Flow:**
1. User session creation with tokenized access
2. Conversation and message logging
3. Real-time message synchronization
4. Report generation and storage
5. Assessment review and approval workflow

### 4. AI/LLM Integration

**Supported Providers:**
- OpenAI (GPT-4, GPT-3.5-turbo)
- Anthropic Claude (Claude-3, Claude-instant)
- Fallback/retry logic for reliability

**Conversation Management:**
- Context window management for long conversations
- Prompt template system with variable injection
- Response parsing and validation
- Error handling and graceful degradation

**Agent System:**
```typescript
interface AssessmentAgent {
  id: string;
  name: string;
  systemPrompt: string;
  tone: 'professional' | 'friendly' | 'formal';
  maxTokens: number;
  temperature: number;
  completionCriteria: string[];
}
```

### 5. Workflow Engine

**Core Workflows:**

**Assessment Flow:**
```
1. User clicks tokenized link
2. System validates token and loads conversation
3. Frontend connects via Socket.io
4. User sends message
5. Backend processes with LLM
6. Response sent back to frontend
7. Conversation logged to database
8. Repeat until completion criteria met
9. Trigger report generation workflow
```

**Report Generation Flow:**
```
1. Conversation marked as 'completed'
2. Background job queued for report generation
3. Full conversation transcript retrieved
4. Report generation prompt executed with LLM
5. Generated report saved to assessments table
6. Optional notification sent to assessment creator
```

## API Design

### REST Endpoints

```
POST /api/assessments/start
GET  /api/assessments/:token
POST /api/assessments/:token/messages
GET  /api/assessments/:token/messages
GET  /api/assessments/:token/report
POST /api/assessments/:token/complete
```

### WebSocket Events

```typescript
// Client to Server
interface ClientEvents {
  'join-assessment': (token: string) => void;
  'send-message': (message: string) => void;
  'typing': () => void;
}

// Server to Client
interface ServerEvents {
  'assessment-joined': (data: AssessmentData) => void;
  'new-message': (message: Message) => void;
  'agent-typing': () => void;
  'assessment-complete': (reportId: string) => void;
  'error': (error: ErrorData) => void;
}
```

## Security Considerations

### Authentication & Authorization
- Tokenized URLs for secure access without traditional auth
- Session-based authentication for multi-step conversations
- Row-level security policies in Supabase
- Rate limiting on API endpoints

### Data Protection
- Encryption at rest and in transit
- PII handling and data retention policies
- GDPR compliance considerations
- Audit logging for sensitive operations

### API Security
- Request validation and sanitization
- CORS configuration for frontend domains
- Environment-based configuration management
- Error message sanitization

## Deployment Architecture

### Development Environment
```
Local Development:
- Frontend: localhost:3000 (Next.js dev server)
- Backend: localhost:5000 (Express server)
- Database: Supabase cloud instance
- LLM: API calls to external providers
```

### Production Environment
```
Vercel (Frontend):
- Next.js application deployed to Vercel
- Edge functions for API routes
- CDN for static assets

Railway/Heroku (Backend):
- Node.js application deployment
- Environment variable management
- Automatic scaling and monitoring

Supabase (Database):
- Managed PostgreSQL instance
- Built-in authentication and APIs
- Real-time subscriptions
```

## Performance Considerations

### Caching Strategy
- Redis for session and conversation caching
- Frontend query caching with React Query
- LLM response caching for common patterns
- Database query optimization with indexes

### Scalability
- Horizontal scaling for backend services
- Database connection pooling
- Message queue for background processing
- CDN for static asset delivery

### Monitoring
- Application performance monitoring (APM)
- Database query performance tracking
- LLM API usage and latency monitoring
- Error tracking and alerting

## Development Workflow

### Local Setup
1. Clone repository
2. Install dependencies (`npm install`)
3. Set environment variables
4. Run database migrations
5. Start development servers
6. Run test suites

### CI/CD Pipeline
1. Code push triggers GitHub Actions
2. Run automated tests (unit, integration, e2e)
3. Build and deploy to staging environment
4. Manual QA and approval
5. Deploy to production environment
6. Post-deployment monitoring and validation

## Next Steps for Implementation

1. **Phase 1**: Basic conversation flow with single agent
2. **Phase 2**: Multi-agent support and report generation
3. **Phase 3**: Advanced features (SMS, email integration)
4. **Phase 4**: Admin dashboard and analytics
5. **Phase 5**: Advanced AI features and optimizations