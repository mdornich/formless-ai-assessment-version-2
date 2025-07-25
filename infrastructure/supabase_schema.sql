-- Formless AI Assessment Platform - Database Schema
-- Version: 1.0
-- Date: July 25, 2025
-- Database: Supabase (PostgreSQL)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    uid VARCHAR(255) UNIQUE, -- for external auth systems
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Instructions library table
CREATE TABLE instructions_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    prompt_text TEXT NOT NULL,
    tone VARCHAR(50) NOT NULL, -- e.g., 'formal', 'friendly', 'professional'
    use_case VARCHAR(100) NOT NULL, -- e.g., 'business_ai_readiness', 'business_owner_competency'
    starter_questions TEXT[] NOT NULL, -- Array of initial questions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assessment_type VARCHAR(100) NOT NULL, -- e.g., 'business_ai_readiness', 'business_owner_competency'
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'completed', 'abandoned'
    current_step INTEGER DEFAULT 1,
    instruction_id UUID REFERENCES instructions_library(id),
    session_token VARCHAR(255) UNIQUE, -- for tokenized URL access
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender VARCHAR(20) NOT NULL, -- 'user' or 'assistant'
    message_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assessments table (final reports)
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    summary_text TEXT, -- Generated report in markdown
    score_json JSONB, -- Structured scoring data
    requires_review BOOLEAN DEFAULT true,
    reviewed BOOLEAN DEFAULT false,
    reviewer_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_session_token ON conversations(session_token);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_assessments_conversation_id ON assessments(conversation_id);
CREATE INDEX idx_assessments_requires_review ON assessments(requires_review);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_instructions_library_updated_at 
    BEFORE UPDATE ON instructions_library 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be expanded based on auth requirements)
-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (id = auth.uid()::uuid);

CREATE POLICY "Users can view own conversations" ON conversations
    FOR SELECT USING (user_id = auth.uid()::uuid);

CREATE POLICY "Users can view own messages" ON messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT id FROM conversations WHERE user_id = auth.uid()::uuid
        )
    );

CREATE POLICY "Users can view own assessments" ON assessments
    FOR SELECT USING (
        conversation_id IN (
            SELECT id FROM conversations WHERE user_id = auth.uid()::uuid
        )
    );

-- Function to generate session tokens
CREATE OR REPLACE FUNCTION generate_session_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$ LANGUAGE plpgsql;

-- Sample data insertion (for development)
-- Insert sample instruction sets
INSERT INTO instructions_library (name, prompt_text, tone, use_case, starter_questions) VALUES
(
    'Business AI Readiness Assessment',
    'You are an AI consultant conducting a comprehensive assessment of a business''s readiness to implement AI solutions. Your goal is to understand their current technology infrastructure, data maturity, team capabilities, and business objectives to provide personalized recommendations. Be professional, thorough, and encouraging while identifying both opportunities and potential challenges.',
    'professional',
    'business_ai_readiness',
    ARRAY[
        'What industry is your business in, and what are your primary business objectives?',
        'Can you describe your current technology infrastructure and data management practices?',
        'What specific business challenges are you hoping AI might help solve?'
    ]
),
(
    'Business Owner AI Competency Assessment',
    'You are an AI literacy coach helping business owners understand their current knowledge level and comfort with AI technologies. Your goal is to assess their understanding of AI concepts, identify learning gaps, and provide guidance on how they can better leverage AI in their business decision-making. Be supportive, educational, and focus on practical applications.',
    'friendly',
    'business_owner_competency',
    ARRAY[
        'How would you describe your current understanding of artificial intelligence and its business applications?',
        'Have you had any previous experience using AI tools or implementing AI solutions in your business?',
        'What are your biggest concerns or excitement points about AI in business?'
    ]
);

-- Comments for documentation
COMMENT ON TABLE users IS 'User profiles for assessment participants';
COMMENT ON TABLE instructions_library IS 'Reusable instruction sets and prompts for different assessment types';
COMMENT ON TABLE conversations IS 'Individual assessment sessions between users and AI agents';
COMMENT ON TABLE messages IS 'Chat messages within each conversation';
COMMENT ON TABLE assessments IS 'Generated reports and evaluations from completed assessments';