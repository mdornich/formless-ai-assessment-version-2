# Formless AI Assessment Backend

A Node.js/Express backend API for the Business Owner AI Competency Assessment platform, featuring dynamic conversation engine powered by Gemini AI and real-time competency detection.

## 🚀 Features

- **Dynamic Conversation Engine**: Adapts questions based on user competency level detection
- **Gemini AI Integration**: Uses Google's Gemini Pro for natural conversation flow
- **Real-time Assessment**: Socket.io for live conversation updates
- **Competency Detection**: Automatically determines user AI maturity level (1-4)
- **Supabase Integration**: Robust data storage and retrieval
- **TypeScript**: Full type safety and modern development experience

## 📋 Prerequisites

- Node.js 18+ and npm 8+
- Supabase account and project
- Google Gemini API key
- Redis instance (for job queues)

## 🛠️ Installation

1. **Navigate to backend directory**
   ```bash
   cd src/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your actual configuration values
   ```

4. **Database setup**
   - Ensure your Supabase project has the required schema (see `../../infrastructure/supabase_schema.sql`)
   - Update `.env` with your Supabase credentials

5. **Build the project**
   ```bash
   npm run build
   ```

## 🔧 Configuration

### Required Environment Variables

```bash
# Server Configuration
NODE_ENV=development
PORT=5000

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Service Configuration
GEMINI_API_KEY=your_gemini_api_key

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000
```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📚 API Documentation

### Assessment Endpoints

#### Start Assessment
```http
POST /api/assessment/start
Content-Type: application/json

{
  "user_name": "John Doe",
  "user_email": "john@example.com",
  "user_company": "Acme Corp",
  "user_role": "CEO",
  "assessment_type": "business_owner_competency"
}
```

#### Get Assessment Status
```http
GET /api/assessment/{assessmentId}
```

### Conversation Endpoints

#### Send Message
```http
POST /api/conversation/{assessmentId}/message
Content-Type: application/json

{
  "message": "I use ChatGPT daily for strategic planning and team coaching."
}
```

#### Get Conversation Context
```http
GET /api/conversation/{assessmentId}/context
```

### Health Check
```http
GET /health
GET /api/assessment/health
GET /api/conversation/health
```

## 🧠 Conversation Engine

### How It Works

1. **Assessment Initialization**: Creates assessment record and starts with random starter question
2. **Dynamic Questioning**: Uses Gemini AI with structured system prompt to generate contextual follow-up questions
3. **Competency Detection**: Analyzes user responses for signals across four dimensions:
   - **Mindset**: Attitude toward AI (cautious → strategic)
   - **Understanding**: Technical grasp of AI capabilities
   - **Usage**: Frequency and sophistication of AI tool usage
   - **Vision**: Ability to see AI's organizational impact

4. **Level Determination**: Maps indicators to 4-level competency framework:
   - **Level 1 (Aware)**: Basic awareness, minimal usage
   - **Level 2 (Exploratory)**: Curious but inconsistent usage
   - **Level 3 (Applied)**: Regular professional usage
   - **Level 4 (Strategic)**: Visionary, transformative mindset

### System Prompt Integration

The conversation engine loads the system prompt from `docs/prompts/business-owner-agent-v3.md`, which provides:
- Role definition and assessment framework
- Dynamic questioning strategy
- Educational mandate for user guidance
- JSON response format requirements

## 🔄 Real-time Features

### Socket.io Events

**Client → Server**
- `join_assessment`: Join assessment room
- `disconnect`: Leave assessment

**Server → Client**
- `assessment_started`: New assessment begun
- `message_received`: New conversation message
- `assessment_completed`: Assessment finished
- `conversation_restarted`: Assessment reset

## 🧪 Testing Strategy

### Unit Tests
- Service layer testing (Gemini, Supabase, ConversationEngine)
- Utility function testing
- Middleware testing

### Integration Tests
- API endpoint testing
- Database integration testing
- AI service integration testing

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin request control  
- **Rate Limiting**: Request throttling
- **Input Validation**: Express-validator integration
- **Error Handling**: Secure error responses

## 🛠️ Development Commands

```bash
# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Building
npm run build

# Testing
npm test
npm run test:watch
```

---

Built with ❤️ for intelligent business assessments