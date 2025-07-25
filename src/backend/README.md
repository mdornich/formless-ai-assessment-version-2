# Assessment Report Generation Backend

This backend service implements the AI-powered assessment report generation system using Gemini AI to create personalized Business Owner AI Competency reports based on conversation data.

## Features

- **Gemini AI Integration**: Uses Google's Gemini 1.5 Pro model for report generation
- **4-Level Competency Framework**: Analyzes users across Aware, Exploratory, Applied, and Strategic levels
- **Personalized Reports**: Creates detailed, actionable assessment reports based on conversation transcripts
- **RESTful API**: Clean API endpoints for generating and retrieving reports
- **Database Integration**: Supabase integration for data persistence
- **Rate Limiting**: Protection against abuse with intelligent rate limiting
- **TypeScript**: Full type safety throughout the application

## API Endpoints

### Generate Assessment Report
```http
POST /api/reports/generate
Content-Type: application/json

{
  "conversation_id": "uuid",
  "assessment_type": "business_owner_competency",
  "user_context": {
    "name": "John Doe",
    "industry": "Technology",
    "company_size": "50 employees",
    "role": "CEO"
  }
}
```

### Get Existing Report
```http
GET /api/reports/:conversation_id
```

### Check Report Status
```http
GET /api/reports/:conversation_id/status
```

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```
   
   Required environment variables:
   - `GEMINI_API_KEY`: Google AI API key for Gemini access
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `PORT`: Server port (default: 3001)

3. **Database Setup**
   Ensure your Supabase database has the required schema (see `../../infrastructure/supabase_schema.sql`)

4. **Development**
   ```bash
   npm run dev
   ```

5. **Production Build**
   ```bash
   npm run build
   npm start
   ```

## 4-Level Competency Framework

The system evaluates business owners across four competency levels:

### Level 1: Aware
- **Mindset**: Cautious, skeptical, or passively curious
- **Understanding**: Surface-level awareness, cannot articulate capabilities
- **Usage**: No regular use, minimal experimentation

### Level 2: Exploratory  
- **Mindset**: Open and curious but inconsistent action
- **Understanding**: Functional grasp of common tools, general opportunities
- **Usage**: Occasional task-specific use, reactive approach

### Level 3: Applied
- **Mindset**: Pragmatic and proactive integration
- **Understanding**: Solid understanding of augmentation, prompt engineering
- **Usage**: Regular professional use as thought partner

### Level 4: Strategic
- **Mindset**: Visionary thinking about transformation
- **Understanding**: Deep strategic implications, systems thinking
- **Usage**: Leading initiatives, coaching teams, strategic analysis

## Report Structure

Generated reports include:

1. **Executive Summary** - High-level assessment and recommendations
2. **Current State Analysis** - Detailed competency scoring across dimensions
3. **Personalized Recommendations** - Immediate, short-term, and long-term actions
4. **Industry-Specific Insights** - Relevant trends and applications
5. **Resource Recommendations** - Curated learning materials and tools
6. **90-Day Action Plan** - Specific steps and milestones

## Architecture

```
src/
├── config/          # Configuration files (Gemini, Supabase)
├── controllers/     # API route handlers
├── services/        # Business logic (ReportGenerationService)
├── types/          # TypeScript type definitions
├── middleware/     # Express middleware (auth, rate limiting, errors)
├── utils/          # Utility functions and test data
└── server.ts       # Express app setup
```

## Testing

Run the test suite:
```bash
npm test
```

Test report generation manually:
```bash
npx ts-node src/utils/testReportGeneration.ts
```

## Error Handling

The system includes comprehensive error handling:
- Input validation with express-validator
- Rate limiting for API protection  
- Structured error responses
- Detailed logging for debugging

## Security

- Helmet.js for security headers
- CORS configuration
- Rate limiting on sensitive endpoints
- Input validation and sanitization
- Environment variable protection

## Performance

- Efficient database queries with proper indexing
- Connection pooling for database operations
- Optimized Gemini API calls with appropriate timeouts
- Caching strategies for repeated requests