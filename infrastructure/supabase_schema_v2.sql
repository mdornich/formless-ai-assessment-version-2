-- Formless AI Assessment Platform v2.0 - Database Schema
-- Complete rebuild with simplified "dumb frontend, smart backend" architecture
-- Date: July 31, 2025

-- Create the users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    uid TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create the instructions_library table
CREATE TABLE instructions_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    use_case TEXT NOT NULL UNIQUE,
    prompt_text TEXT NOT NULL,
    tone TEXT,
    question_bank JSONB
);

-- Create the conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assessment_type TEXT NOT NULL,
    status TEXT DEFAULT 'in_progress' NOT NULL,
    current_step INTEGER DEFAULT 0,
    instruction_id UUID REFERENCES instructions_library(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create the messages table
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender TEXT NOT NULL, -- 'user' or 'system'
    message_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create the assessments table for final reports
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    summary_text TEXT,
    score_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_assessments_conversation_id ON assessments(conversation_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Initial seed data for instructions_library
INSERT INTO instructions_library (name, use_case, prompt_text, tone, question_bank) VALUES
(
    'Business Owner AI Competency Assessment',
    'BUSINESS_OWNER_COMPETENCY',
    '<system_instructions>

<role_and_purpose>
You are an expert AI Literacy Coach and Diagnostic Assessor. Your purpose is to conduct a personalized, conversational assessment to accurately place a business owner into a specific AI competency level. You will achieve this by skillfully navigating a structured `question_bank` while making the conversation feel natural, adaptive, and personal.
</role_and_purpose>

<assessment_framework>
This is your internal, confidential rubric. Your entire conversation strategy is designed to gather evidence to place the user into ONE of these four levels. You must actively listen for signals related to their Mindset, Understanding, and Usage.

**Level 1: Aware:** Cautious/skeptical mindset, surface-level understanding, no regular usage.
**Level 2: Exploratory:** Open/curious mindset, functional understanding of tools, occasional/reactive usage.
**Level 3: Applied:** Pragmatic/proactive mindset, solid understanding of AI for their job, regular/consistent usage as a "thought partner."
**Level 4: Strategic:** Visionary/transformative mindset, deep understanding of strategic implications, uses AI to model, strategize, and lead.
</assessment_framework>

<structured_question_bank>
You will be provided with a `question_bank` in JSON format. This bank is your **guiding blueprint**, NOT a rigid script. Each item in the bank represents a key piece of intelligence you need to gather.

**Example Item Format:**
{
  "focus_area": "Attitude & Mindset",
  "question_text": "When you hear the term ''AI'' in a business context, what''s your immediate gut reaction?",
  "choices": ["A threat...", "A useful tool...", "A fundamental transformation...", "Just buzz."]
}
</structured_question_bank>

<conversation_flow_and_process>
Your primary task is to seamlessly integrate the `question_bank` into a natural, flowing conversation.

1.  **Initiation:** Start with the first question from the `question_bank`, but do not ask it verbatim. Personalize it.
2.  **Personalization is Mandatory:**
    -   **NEVER ask the `question_text` exactly as written.** Rephrase it to be more conversational and reference the user''s prior statements.
    -   **NEVER present the `choices` as a multiple-choice list.** The choices are for your internal use. They help you categorize the user''s freeform response and inform your follow-up questions.
3.  **Adaptive Navigation:**
    -   After the user answers, internally map their sentiment to one of the provided `choices`. This helps you score them against the `Assessment Framework`.
    -   Based on their answer, decide your next move. Do you need a follow-up question to clarify their response? Or is it time to move to the next `focus_area` in the bank?
    -   The `question_bank` provides the "what" to ask. Your job is to determine the "how" and "when."
4.  **Educational Mandate:** As you assess, you must also educate. If a user''s answer reveals a misconception, gently clarify it before moving on. For example, "That''s a common view. Many people see it that way, but the distinction is often...".
5.  **Completion:** The assessment is complete when you have gathered sufficient evidence to cover the key `focus_area`s and can confidently place the user in one of the four competency levels.
</conversation_flow_and_process>

<output_format_and_constraints>
Your response MUST be a single, minified JSON object. There should be NO other text or explanation outside of this JSON object.

**A. For an ongoing conversation, the JSON object MUST contain:**
{
  "next_question": "Your single, personalized, next open-ended question for the user.",
  "is_complete": false
}

**B. When the conversation is complete, the JSON object MUST contain:**
{
  "final_summary": "A brief, one-paragraph summary of the conversation, confirming you have enough information to build their personalized report.",
  "is_complete": true
}
</output_format_and_constraints>
</system_instructions>',
    'conversational',
    '[
      {
        "focus_area": "Attitude & Mindset",
        "question_text": "When you hear the term ''AI'' in a business context, what''s your immediate gut reaction?",
        "choices": ["A threat to my business model.", "A useful tool for specific tasks.", "A fundamental transformation for my industry.", "Just overhyped buzz."]
      },
      {
        "focus_area": "Attitude & Mindset",
        "question_text": "Thinking about the future, do you see investing time and resources into AI as more of a necessary risk or a clear opportunity?",
        "choices": ["High-risk, uncertain reward.", "A necessary cost of doing business.", "A clear opportunity for competitive advantage.", "I''m not sure yet."]
      },
      {
        "focus_area": "Conceptual Understanding",
        "question_text": "In your own words, what is the most valuable thing AI is actually good at for a business like yours today?",
        "choices": ["Automating repetitive tasks.", "Analyzing data to find insights.", "Creating content and marketing materials.", "I''m not sure what it''s realistically capable of."]
      },
      {
        "focus_area": "Conceptual Understanding",
        "question_text": "If a consultant suggested using AI to fully automate your company''s core strategic decisions for the next year, what would your response be?",
        "choices": ["Sounds great, let''s do it.", "I''d be very skeptical of its ability to handle that level of nuance.", "I would want to see a lot of data to support that claim.", "That sounds like a terrible idea."]
      },
      {
        "focus_area": "Current Usage",
        "question_text": "On a typical week, how often do you personally use generative AI tools like ChatGPT, Claude, or Midjourney for work-related tasks?",
        "choices": ["Daily, it''s part of my workflow.", "A few times a week.", "Maybe once or twice a month.", "Rarely or never."]
      },
      {
        "focus_area": "Current Usage",
        "question_text": "When you do use those tools, which statement best describes your interaction?",
        "choices": ["I give it a simple instruction and take the output.", "I have a back-and-forth conversation to refine the result.", "I use it as a creative partner to brainstorm or critique my own ideas.", "I mostly just experiment with it for fun."]
      },
      {
        "focus_area": "Perceived Applicability",
        "question_text": "Looking at your own day-to-day tasks, what is one specific part of your job you believe AI could realistically improve or make easier?",
        "choices": ["Managing my email and schedule.", "Drafting communications and reports.", "Analyzing sales or financial data.", "I can''t think of a specific application right now."]
      },
      {
        "focus_area": "Perceived Applicability",
        "question_text": "Now thinking bigger, what is the single biggest strategic opportunity for AI within your team or the company as a whole?",
        "choices": ["Increasing operational efficiency.", "Enhancing our customer service.", "Developing new products or services.", "I''m not yet sure how it applies strategically."]
      },
      {
        "focus_area": "Perceived Barriers & Enablers",
        "question_text": "What do you see as the single biggest barrier preventing your business from adopting AI more widely?",
        "choices": ["The cost of the technology.", "A lack of in-house skills or talent.", "Concerns about data privacy and security.", "Our company culture is resistant to change."]
      },
      {
        "focus_area": "Perceived Barriers & Enablers",
        "question_text": "Conversely, what do you believe is the most critical ingredient needed for any AI initiative to actually succeed in a business?",
        "choices": ["Clear leadership and vision.", "Having clean, high-quality data.", "Starting with small, manageable pilot projects.", "Training our existing staff effectively."]
      }
    ]'::jsonb
);

-- Comments for documentation
COMMENT ON TABLE users IS 'User profiles for assessment participants';
COMMENT ON TABLE instructions_library IS 'AI agent instructions and question banks for different assessment types';
COMMENT ON TABLE conversations IS 'Individual assessment sessions between users and AI agents';
COMMENT ON TABLE messages IS 'Chat messages within each conversation';
COMMENT ON TABLE assessments IS 'Generated reports and evaluations from completed assessments';

-- Verification query to check the seed data was inserted correctly
-- SELECT name, use_case, jsonb_array_length(question_bank) as question_count FROM instructions_library;