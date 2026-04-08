-- Reseed script: delete all rows across every table and restore initial seed data.
-- Run order respects FK dependencies (children first, parents last for deletes;
-- parents first, children last for inserts).

-- ── Delete all rows ───────────────────────────────────────────────────────────
DELETE FROM QuizAnswers;
DELETE FROM QuizEventStates;
DELETE FROM QuizQuestions;
DELETE FROM IdeaVotes;
DELETE FROM Comics;
DELETE FROM Stories;
DELETE FROM StartupIdeas;
DELETE FROM AppUsers;
DELETE FROM WeatherRecords;
DELETE FROM AppSettings;
DELETE FROM Events;

-- ── Reset identity sequences ──────────────────────────────────────────────────
DBCC CHECKIDENT ('AppUsers',       RESEED, 1);
DBCC CHECKIDENT ('Comics',         RESEED, 1);
DBCC CHECKIDENT ('Stories',        RESEED, 1);
DBCC CHECKIDENT ('StartupIdeas',   RESEED, 1);
DBCC CHECKIDENT ('WeatherRecords', RESEED, 1);
DBCC CHECKIDENT ('Events',         RESEED, 1);
DBCC CHECKIDENT ('QuizQuestions',   RESEED, 1);
DBCC CHECKIDENT ('QuizEventStates', RESEED, 1);
DBCC CHECKIDENT ('QuizAnswers',     RESEED, 1);

-- ── Events ──────────────────────────────────────────────────────────────────────
SET IDENTITY_INSERT Events ON;
INSERT INTO Events (Id,Name,CreatedAt) VALUES (1, N'Sydney', '2026-04-04T00:00:00.000');
INSERT INTO Events (Id,Name,CreatedAt) VALUES (2, N'Melbourne', '2026-04-04T00:00:00.000');
SET IDENTITY_INSERT Events OFF;

-- ── WeatherRecords ────────────────────────────────────────────────────────────
SET IDENTITY_INSERT WeatherRecords ON;
INSERT INTO WeatherRecords (Id,City,Condition,TemperatureCelsius,Humidity,WindSpeedKmh,RecordedAt) VALUES (1, N'New York', N'Sunny', 22.5, 55, 15, '2024-01-01T00:00:00.000');
INSERT INTO WeatherRecords (Id,City,Condition,TemperatureCelsius,Humidity,WindSpeedKmh,RecordedAt) VALUES (2, N'London', N'Cloudy', 14, 72, 20, '2024-01-01T00:00:00.000');
INSERT INTO WeatherRecords (Id,City,Condition,TemperatureCelsius,Humidity,WindSpeedKmh,RecordedAt) VALUES (3, N'Tokyo', N'Rainy', 18, 85, 10, '2024-01-01T00:00:00.000');
INSERT INTO WeatherRecords (Id,City,Condition,TemperatureCelsius,Humidity,WindSpeedKmh,RecordedAt) VALUES (4, N'Sydney', N'Partly Cloudy', 26, 60, 25, '2024-01-01T00:00:00.000');
INSERT INTO WeatherRecords (Id,City,Condition,TemperatureCelsius,Humidity,WindSpeedKmh,RecordedAt) VALUES (5, N'Paris', N'Clear', 19.5, 50, 12, '2024-01-01T00:00:00.000');
SET IDENTITY_INSERT WeatherRecords OFF;

-- ── AppSettings ───────────────────────────────────────────────────────────────
INSERT INTO AppSettings ([Key], Value) VALUES (N'nav-config', N'{"genai":{"chat":false,"translation":false,"speech":false,"realtime":false},"startup":{"ideas":false,"storybook":false,"comic":false,"agent":false,"webbuilder":false},"gallery":true,"quiz":true}');

-- ── AppUsers ──────────────────────────────────────────────────────────────────
SET IDENTITY_INSERT AppUsers ON;
INSERT INTO AppUsers (Id,Username,EventName,CreatedAt, EventName, Score) VALUES (1, N'Daniel', N'', '2026-04-01T10:38:53.423', 'Sydney', 0);
INSERT INTO AppUsers (Id,Username,EventName,CreatedAt, EventName, Score) VALUES (2, N'Wendy', N'', '2026-04-01T10:38:53.423', 'Melbourne', 0);
SET IDENTITY_INSERT AppUsers OFF;

-- ── StartupIdeas ──────────────────────────────────────────────────────────────
SET IDENTITY_INSERT StartupIdeas ON;
INSERT INTO StartupIdeas (Id,UserId,Title,IdeaDescription,ProblemStatement,TargetAudience,BusinessModel,CoverImageUrl,CoverImagePrompt,AgentName,AgentSystemPrompt,AgentModel,AgentTemperature,WebsiteUrl,HasWebBuilder,IsPublished,CreatedAt,UpdatedAt) VALUES (1, 1, N'Choc Factory', N'### 1. **Adventure Concept**
A mysterious chocolate factory appears overnight in a small town. It''s said that whoever enters the factory is granted a wish—but at a cost. A group of kids ventures inside and discovers the truth behind the factory''s magic.

### 2. **Fantasy Twist**
The Choc Factory is not a chocolate factory at all; it''s a portal disguised as one. Everyone who eats the chocolate is transported to a whimsical, candy-coated world, but they must solve riddles to return home.

### 3. **Dark Thriller**
The Choc Factory is the last remaining chocolate producer in a dystopian world where cocoa has become a rare resource. The factory''s owner holds dark secrets, and a young journalist infiltrates the company to expose the truth.', NULL, NULL, NULL, N'https://aihack26st.blob.core.windows.net/images/cc6d387b-2e7d-4c26-9037-b9707b7dbbe6.png', N'choc factory fun image', N'Choc Factory Agent', N'You are a helpful Choc Factory Agent.

I know everything about chocolate', N'', 1.17, NULL, N'True', N'True', '2026-04-03T09:25:10.463', '2026-04-03T22:49:25.017');
INSERT INTO StartupIdeas (Id,UserId,Title,IdeaDescription,ProblemStatement,TargetAudience,BusinessModel,CoverImageUrl,CoverImagePrompt,AgentName,AgentSystemPrompt,AgentModel,AgentTemperature,WebsiteUrl,HasWebBuilder,IsPublished,CreatedAt,UpdatedAt) VALUES (2, 2, N'Smile Generator', N'The world had forgotten how to smile.

Years of conflict, climate collapse, and creeping isolation had drained humanity of its joy. Cities bustled with people, but their faces were blank slates—expressions of exhaustion, indifference, and quiet despair. Laughter had become a rare sound, so rare that when it echoed off the concrete buildings, people stopped in confusion, as if hearing a bird call they''d long forgotten.

It was in this world that 17-year-old Ellie discovered the Smile Generator.

It wasn''t much to look at: a small, cube-shaped device tucked away in a dusty corner of her grandfather''s workshop. The machine hummed faintly, its surface etched with symbols she didn''t recognize. A single button sat on the top, glowing faintly like a heartbeat. Above it, a tiny screen displayed three words: **"Generate a Smile."**

Ellie laughed, the sound startling even her. She hadn''t smiled in weeks. Maybe months. Yet, for reasons she couldn''t explain, she pressed the button.

The machine whirred to life, releasing a gentle pulse of light. For a moment, Ellie felt… something. Warmth spread from her chest, and a memory flickered in her mind—her mother singing softly to her as a child, the rhythm of the song bringing tears to her eyes.

And then, she smiled.

It wasn''t forced or fleeting. It was the kind of smile that felt like sunshine breaking through a storm.

But Ellie had no idea what she''d just started.', NULL, NULL, NULL, N'https://aihack26st.blob.core.windows.net/images/2a743bbd-2051-4257-b3ae-e23e8999e3a5.png', N'create smile generator imgae', N'Smile Agent', N'You are a helpful Smile Agent.

I smile every time', N'', 1.17, NULL, N'True', N'True', '2026-04-03T20:06:59.341', '2026-04-03T22:52:54.933');
SET IDENTITY_INSERT StartupIdeas OFF;

-- ── Comics ────────────────────────────────────────────────────────────────────
SET IDENTITY_INSERT Comics ON;
INSERT INTO Comics (Id,UserId,Description,ImageUrl,CreatedAt) VALUES (1, 1, N'create smile generator imgae', N'https://aihack26st.blob.core.windows.net/images/2a743bbd-2051-4257-b3ae-e23e8999e3a5.png', '2026-04-03T22:43:46.614');
INSERT INTO Comics (Id,UserId,Description,ImageUrl,CreatedAt) VALUES (2, 2, N'choc factory fun image', N'https://aihack26st.blob.core.windows.net/images/cc6d387b-2e7d-4c26-9037-b9707b7dbbe6.png', '2026-04-03T22:49:17.726');
SET IDENTITY_INSERT Comics OFF;

-- ── QuizQuestions ─────────────────────────────────────────────────────────────
SET IDENTITY_INSERT QuizQuestions ON;
INSERT INTO QuizQuestions (Id,Text,OptionsJson,CorrectIndex,DisplayOrder) VALUES (1, N'What does AI stand for?', N'["Automated Intelligence","Artificial Intelligence","Advanced Integration","Applied Information"]', 1, 0);
INSERT INTO QuizQuestions (Id,Text,OptionsJson,CorrectIndex,DisplayOrder) VALUES (2, N'Which Microsoft AI assistant is built into Windows 11 and Microsoft 365?', N'["Siri","Alexa","Copilot","Bixby"]', 2, 1);
INSERT INTO QuizQuestions (Id,Text,OptionsJson,CorrectIndex,DisplayOrder) VALUES (3, N'What is a Large Language Model (LLM)?', N'["A very big dictionary","An AI trained on text to understand and generate language","A programming language for AI","A type of database"]', 1, 2);
INSERT INTO QuizQuestions (Id,Text,OptionsJson,CorrectIndex,DisplayOrder) VALUES (4, N'Which of the following is one of Microsoft''s 6 Responsible AI principles?', N'["Speed","Fairness","Profitability","Complexity"]', 1, 3);
INSERT INTO QuizQuestions (Id,Text,OptionsJson,CorrectIndex,DisplayOrder) VALUES (5, N'What is ''prompt engineering''?', N'["Building hardware for AI chips","Designing prompts to get better AI outputs","Writing AI source code","Training neural networks"]', 1, 4);
INSERT INTO QuizQuestions (Id,Text,OptionsJson,CorrectIndex,DisplayOrder) VALUES (6, N'In Microsoft''s Responsible AI framework, which principle means AI should not disadvantage people based on race, gender, or other factors?', N'["Reliability","Privacy","Fairness","Accountability"]', 2, 5);
INSERT INTO QuizQuestions (Id,Text,OptionsJson,CorrectIndex,DisplayOrder) VALUES (7, N'What is Microsoft Foundry?', N'["A cloud platform for building and deploying AI models and applications","A robot manufacturing facility","A Microsoft gaming service","A programming language"]', 0, 6);
INSERT INTO QuizQuestions (Id,Text,OptionsJson,CorrectIndex,DisplayOrder) VALUES (8, N'What does ''AI bias'' mean?', N'["AI that prefers certain programming languages","When AI produces unfair or skewed results due to flawed training data","The speed difference between AI models","AI that only works in one country"]', 1, 7);
INSERT INTO QuizQuestions (Id,Text,OptionsJson,CorrectIndex,DisplayOrder) VALUES (9, N'Which Microsoft Responsible AI principle ensures humans remain in control of AI decisions?', N'["Transparency","Human oversight and control (Accountability)","Inclusiveness","Reliability"]', 1, 8);
INSERT INTO QuizQuestions (Id,Text,OptionsJson,CorrectIndex,DisplayOrder) VALUES (10, N'What is ''machine learning''?', N'["Teaching robots to walk","A type of AI where systems learn patterns from data without being explicitly programmed","Writing code that runs very fast","A Microsoft Office feature"]', 1, 9);
SET IDENTITY_INSERT QuizQuestions OFF;

PRINT 'Database reseeded successfully.';
