# Formless AI Assessment - Frontend

A Next.js React chat interface for the Business Owner AI Competency Assessment platform.

## Features

- **Conversational Chat Interface**: Clean, mobile-responsive chat UI with message bubbles
- **Real-time Communication**: Socket.io integration for live messaging and typing indicators
- **Session Token Authentication**: Secure tokenized access to assessments
- **Mobile-Responsive Design**: Optimized for all device sizes using Tailwind CSS
- **Loading States & Error Handling**: Comprehensive error handling and loading indicators
- **TypeScript Support**: Full type safety throughout the application
- **React Query Integration**: Efficient state management and API caching

## Tech Stack

- **Next.js 14**: React framework with SSR and routing
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **React Query**: Data fetching and state management
- **Socket.io Client**: Real-time communication
- **React Hook Form**: Form handling with validation
- **Framer Motion**: Smooth animations
- **Lucide React**: Modern icon library

## Getting Started

### Prerequisites

- Node.js 18+ and npm 8+
- Backend API server running (see `../backend/README.md`)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run type-check`: Run TypeScript type checking

## Project Structure

```
src/
├── components/           # React components
│   ├── Chat/            # Chat interface components
│   ├── Assessment/      # Assessment-specific components
│   └── Common/          # Reusable UI components
├── hooks/               # Custom React hooks
├── pages/               # Next.js pages and API routes
├── styles/              # Global styles and Tailwind config
├── types/               # TypeScript type definitions
└── utils/               # Utility functions and API client
```

## Key Components

### Chat Interface
- `ChatInterface`: Main chat container with header and status
- `MessageList`: Scrollable list of messages with auto-scroll
- `MessageBubble`: Individual message display with timestamps
- `InputField`: Auto-resizing textarea with send button
- `TypingIndicator`: Animated typing dots

### Assessment Flow
- `[token].tsx`: Dynamic assessment page with token routing
- `AssessmentComplete`: Completion screen with report access
- `HomePage`: Landing page with demo and token entry

### Hooks
- `useAssessment`: Assessment data and API interactions
- `useSocket`: Real-time Socket.io connection management

## API Integration

The frontend connects to the backend API for:
- Assessment validation and data retrieval
- Message sending and history
- Real-time communication via Socket.io
- Report generation and access

API endpoints:
- `GET /api/assessments/:token` - Get assessment details
- `GET /api/assessments/:token/messages` - Get message history  
- `POST /api/assessments/:token/messages` - Send new message
- `GET /api/assessments/:token/report` - Get assessment report

## Socket Events

### Client → Server
- `join-assessment`: Join assessment room
- `send-message`: Send message
- `typing`: User typing indicator

### Server → Client
- `assessment-joined`: Successful room join
- `new-message`: New message received
- `agent-typing`: Agent typing indicator
- `assessment-complete`: Assessment finished
- `error`: Error occurred

## Mobile Responsiveness

The interface is fully responsive with:
- Adaptive message bubbles (280px → lg widths)
- Mobile-optimized input field and buttons
- Hidden secondary UI elements on small screens
- Touch-friendly interactive elements
- Smooth scrolling and animations

## Error Handling

Comprehensive error handling includes:
- Network connectivity issues
- Invalid or expired tokens
- API errors with user-friendly messages
- Socket connection failures with retry logic
- Form validation and submission errors

## Development

### Code Style
- ESLint with Next.js recommended rules
- Prettier for code formatting
- TypeScript strict mode enabled
- Tailwind CSS for consistent styling

### Testing
```bash
# Type checking
npm run type-check

# Linting
npm run lint
```

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Start production server:
```bash
npm run start
```

For deployment to Vercel or similar platforms, ensure environment variables are configured in your deployment platform.

## Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API base URL
- `NEXT_PUBLIC_SOCKET_URL`: Socket.io server URL

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Modern browsers with ES2020 support required.