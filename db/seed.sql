-- Reseed script: delete all rows across every table and restore initial seed data.
-- Run order respects FK dependencies (children first, parents last for deletes;
-- parents first, children last for inserts).

-- ── Delete all rows ───────────────────────────────────────────────────────────
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

-- ── Events ──────────────────────────────────────────────────────────────────────
SET IDENTITY_INSERT Events ON;
INSERT INTO Events (Id,Name,CreatedAt) VALUES (1, N'AI Hack 2026', '2026-04-04T00:00:00.000');
INSERT INTO Events (Id,Name,CreatedAt) VALUES (2, N'Demo Day', '2026-04-04T00:00:00.000');
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
INSERT INTO AppUsers (Id,Username,EventName,CreatedAt) VALUES (1, N'Daniel', N'', '2026-04-01T10:38:53.423');
INSERT INTO AppUsers (Id,Username,EventName,CreatedAt) VALUES (2, N'Wendy', N'', '2026-04-01T10:38:53.423');
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

PRINT 'Database reseeded successfully.';
