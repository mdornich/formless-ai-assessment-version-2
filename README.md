# Formless AI Assessment Platform v2.0

**Complete Rebuild - Simplified Architecture**

An AI-powered conversational assessment platform inspired by Typeform's Formless. Users engage in dynamic conversations that adapt based on their answers, driven by LLMs, with automated generation of personalized reports.

> This is version 2.0 featuring a "dumb frontend, smart backend" architecture where the AI handles all conversation logic.

## 🎯 Project Overview

The platform supports two initial use cases:
- **AI-readiness assessments for businesses**
- **AI competency assessments for business owners**

Key features include multi-channel entry (web, SMS, email), intelligent conversation flow, and automated report generation designed to showcase expertise and build consulting relationships.

## 📋 Project Structure

```
/formless-ai-assessment/
├── .github/                    # GitHub Actions, issue templates
├── docs/                       # Project documentation
│   ├── PRD-v1.2.md            # Product Requirements Document
│   ├── technical-architecture.md # Technical architecture overview
│   └── development-roadmap.md  # Implementation roadmap
├── infrastructure/             # Infrastructure as Code
│   └── supabase_schema.sql    # Database schema
├── prompts/                   # AI agent system prompts
│   ├── business_ai_readiness_agent.md
│   ├── business_owner_competency_agent.md
│   └── report_generator.md
├── src/                       # Source code
│   ├── frontend/              # Next.js React application
│   └── backend/               # Node.js Express API
├── package.json               # Root package configuration
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 8+
- Supabase account and project
- OpenAI API key (and optionally Anthropic API key)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mitchdornich/formless-ai-assessment.git
   cd formless-ai-assessment
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your actual configuration values
   ```

4. **Database setup**
   - Create a new Supabase project
   - Run the SQL schema from `infrastructure/supabase_schema.sql`
   - Update `.env` with your Supabase credentials

5. **Start development servers**
   ```bash
   npm run dev
   ```

   This runs both frontend (localhost:3000) and backend (localhost:5000) concurrently.

## 🏗️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend in development mode
npm run dev:frontend     # Start only frontend development server
npm run dev:backend      # Start only backend development server

# Building
npm run build           # Build both frontend and backend for production
npm run build:frontend  # Build frontend only
npm run build:backend   # Build backend only

# Testing & Quality
npm run test            # Run backend tests
npm run lint            # Lint both frontend and backend
npm run type-check      # TypeScript type checking

# Utilities
npm run clean           # Clean all build artifacts and node_modules
```

### Tech Stack

**Frontend:**
- Next.js 14 with TypeScript
- Tailwind CSS for styling
- React Query for state management
- Socket.io for real-time messaging

**Backend:**
- Node.js with Express and TypeScript
- Supabase for database and authentication
- Socket.io for real-time communication
- Bull for job queuing
- OpenAI/Anthropic SDKs for LLM integration

**Infrastructure:**
- Supabase (PostgreSQL database + auth)
- Vercel (frontend deployment)
- Railway/Heroku (backend deployment)
- Redis (job queues and caching)

## 📖 Documentation

- **[Product Requirements Document](docs/PRD-v1.2.md)** - Complete feature specifications
- **[Technical Architecture](docs/technical-architecture.md)** - System design and components
- **[Development Roadmap](docs/development-roadmap.md)** - Implementation phases and timeline

## 🔧 Configuration

Key environment variables (see `.env.example` for complete list):

```bash
# Database
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Services
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# Application
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
```

## 🧪 Testing

```bash
# Run backend tests
npm run test

# Run tests in watch mode
cd src/backend && npm run test:watch

# Frontend testing (when implemented)
cd src/frontend && npm run test
```

## 🚢 Deployment

### Frontend (Vercel)
1. Connect repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Backend (Railway/Heroku)
1. Create new Railway/Heroku app
2. Connect repository
3. Set environment variables
4. Configure build and start commands

### Database (Supabase)
- Production database runs on Supabase cloud
- Apply schema changes via Supabase dashboard or migrations

## 📊 Current Status

**Phase 1: Foundation & Core MVP** (In Progress)
- [x] Project setup and documentation
- [x] Database schema design
- [x] AI agent prompt templates
- [ ] Backend foundation (Week 2)
- [ ] Frontend foundation (Week 3)
- [ ] End-to-end integration (Week 4)

See [Development Roadmap](docs/development-roadmap.md) for detailed progress tracking.

## 🤝 Contributing

1. Create a feature branch from main
2. Make your changes with tests
3. Run linting and type checking
4. Submit a pull request with clear description

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For questions or issues:
- Check the [documentation](docs/)
- Review [technical architecture](docs/technical-architecture.md)
- Open an issue on GitHub

---

**Built with ❤️ for intelligent business assessments**