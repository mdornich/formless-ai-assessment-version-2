Product Requirements Document (PRD)
Product Name: Formless AI Assessment Platform
Prepared by: Mitch 
Version: 1.2 (Includes Epics, User Stories & NFRs)
Date: July 25, 2025

1. Product Summary
A self-hosted, AI-powered assessment platform inspired by Typeform's Formless. Users engage in dynamic conversations that adapt based on their answers, driven by LLMs. The platform supports two initial use cases: AI-readiness assessments for businesses and AI competency assessments for business owners.
A key deliverable is the automated generation of a personalized, valuable report for the user upon completion, designed to reward them for their time, showcase our expertise, and serve as a foundation for a future consulting relationship.

2. Objectives & Goals

3. User Personas
Respondent (e.g., Mitch the Business Owner): Arrives via any channel, begins the assessment instantly, and receives a valuable, personalized report upon completion.
Assessment Creator (Internal): Defines and manages the instruction sets, starter questions, and report generation prompts for each assessment type. Reviews generated outputs.
AI Assistant (System Agent): The conversationalist. Two initial personas: "Business AI Readiness Agent" and "Business Owner AI Competency Agent."

4. Epics & User Stories
This section breaks down the high-level features into actionable user stories for the development team.
Epic 1: Instruction System
The core component where creators define the goals, schema, and tone of a conversation.
Story 1.1: As an Assessment Creator, I want to define the high-level goal, tone, and data schema for an assessment so that the AI agent can conduct a conversation to meet those requirements.
Acceptance Criteria:
An Instruction Set can be stored in the database (instructions_library table).
The set must contain a natural language goal, tone indicators (e.g., 'formal', 'friendly'), and a starter set of questions.
The agentic workflow can retrieve and use this instruction set to initialize a new conversation.
Epic 2: Multi-Channel Entry
Allows users to begin assessments from various channels.
Story 2.1: As a Respondent, I want to click a unique link in an email so that I can begin my assessment in a web browser.
Acceptance Criteria:
A unique, tokenized URL is generated for a specific user session.
Clicking the link opens the web-based conversational UI.
The system correctly identifies and loads the user's conversation state based on the token.
Story 2.2: As a Respondent, I want to tap a unique link in an SMS message so that I can begin my assessment on my mobile device.
Acceptance Criteria:
A unique, tokenized URL is generated and can be sent via an SMS service (e.g., Twilio).
Tapping the link opens the conversational UI in a mobile web browser.
The system correctly identifies the user's session from the token.
Epic 3: Agentic Workflow Engine
The backend "brain" that drives the conversation logic.
Story 3.1: As a Respondent, I want the system to ask me relevant follow-up questions based on my previous answers so that the conversation feels natural and intelligent.
Acceptance Criteria:
After a user submits an answer, the backend workflow receives the new message.
The workflow uses the full conversation history and the Instruction Set to call an LLM.
The LLM's response (the next question) is captured and sent back to the UI to be displayed to the user.
Epic 4: Automated Post-Assessment Report Generation
Creates the final, valuable deliverable for the user.
Story 4.1: As an Assessment Creator, I want the system to automatically generate a high-value, personalized report when a conversation is complete, so that the respondent feels rewarded and sees our expertise.
Acceptance Criteria:
A distinct workflow is triggered when a conversation's status is updated to 'completed'.
The workflow retrieves the full conversation transcript from the messages table.
It calls an LLM with a dedicated "Report Generation" prompt, providing the transcript as context.
The generated report (in a structured format like Markdown) is saved to the assessments table, linked to the correct conversation.

5. Data Model (Supabase)
plaintext
users: id, email, phone, uid, created_at
conversations: id, user_id, assessment_type, status, current_step, instruction_id, created_at
messages: id, conversation_id, sender, message_text, created_at
instructions_library: id, name, prompt_text, tone, use_case, starter_questions (array)
assessments: id, conversation_id, summary_text, score_json, requires_review, reviewed, reviewer_notes, created_at

6. Tech Stack (Flexible)

7. MVP Features & Functions
Core Functions:
User starts an assessment via a link.
The system routes to the correct assessment type (business or owner).
The AI agent dynamically asks questions based on a starter set and user answers.
Conversation is logged to Supabase.
Upon completion, the Report Generation workflow runs and saves a valuable summary to the assessments table.
The Assessment Creator can manually review the output in the database.
Exclusions from MVP:
Automated emailing/delivery of the final report to the user.
Admin dashboard UI for managing instructions or reviewing assessments.
Session resume functionality.

8. High-Level Architecture
plaintext
[User Entry: Web/SMS/Email] -> [Frontend Web App] -> [Supabase DB + Auth] -> [Backend Logic] -> [LLM Agent] -> [Question Routing Logic] -> [Output Generator] -> [Reviewer]

9. Next Steps

10. Success Metrics

11. Non-Functional Requirements (NFRs)
Performance: The AI assistant's response time between questions must be under 3 seconds.
Scalability: The MVP system must support at least 50 concurrent assessment sessions.
Usability: The interface must be intuitive enough for a non-technical user to complete the assessment without needing separate instructions.

12. Error Handling & Edge Cases
LLM Failure: If the primary LLM API call fails, the system will retry twice. On failure, the UI will display a "Thinking..." message. If all retries fail, the conversation will end gracefully.
Invalid User Input: If a user's response is empty or unintelligible, the AI agent will politely re-prompt up to two times before moving on.
Downstream Service Failure: If an external service (e.g., Twilio) is unavailable, the action will be queued and retried asynchronously, and the failure will be logged.