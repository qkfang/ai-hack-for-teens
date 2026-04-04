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

-- ── Reset identity sequences ──────────────────────────────────────────────────
DBCC CHECKIDENT ('AppUsers',      RESEED, 0);
DBCC CHECKIDENT ('Comics',        RESEED, 0);
DBCC CHECKIDENT ('Stories',       RESEED, 0);
DBCC CHECKIDENT ('StartupIdeas',  RESEED, 0);
DBCC CHECKIDENT ('WeatherRecords', RESEED, 0);

-- ── WeatherRecords ────────────────────────────────────────────────────────────
SET IDENTITY_INSERT WeatherRecords ON;
INSERT INTO WeatherRecords (Id, City, Condition, TemperatureCelsius, Humidity, WindSpeedKmh, RecordedAt) VALUES
    (1, N'New York', N'Sunny',         22.5, 55.0, 15.0, '2024-01-01T00:00:00.000'),
    (2, N'London',   N'Cloudy',        14.0, 72.0, 20.0, '2024-01-01T00:00:00.000'),
    (3, N'Tokyo',    N'Rainy',         18.0, 85.0, 10.0, '2024-01-01T00:00:00.000'),
    (4, N'Sydney',   N'Partly Cloudy', 26.0, 60.0, 25.0, '2024-01-01T00:00:00.000'),
    (5, N'Paris',    N'Clear',         19.5, 50.0, 12.0, '2024-01-01T00:00:00.000');
SET IDENTITY_INSERT WeatherRecords OFF;

-- ── AppSettings ───────────────────────────────────────────────────────────────
INSERT INTO AppSettings ([Key], Value) VALUES
    (N'nav-config', N'{"genai":{"chat":false,"translation":false,"speech":false,"realtime":false},"startup":{"ideas":false,"storybook":false,"comic":false,"agent":false,"webbuilder":false},"gallery":true,"quiz":true}');

PRINT 'Database reseeded successfully.';
