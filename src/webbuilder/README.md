# Web Builder

A Next.js web application that lets users build their own million-dollar startup website using GitHub Copilot AI.

## Features

- AI-powered HTML page builder via GitHub Copilot
- User-specific designs saved per user ID
- Gallery of all user designs
- Read-only view for sharing designs
- Admin mode (passcode: 9999) to switch between users

## URL Parameters

When launched from the AI Hack Studio, the following URL parameters are supported:

- `?userId=<id>` - Load a specific user's design (the user's ID from the playground)
- `?userName=<name>` - The user's display name (used if userId is not found)

Example: `http://localhost:3000?userId=user-123&userName=Alice`

## Admin Mode

Click on the user profile in the top right, then click "Admin" and enter passcode `9999` to unlock the full user switcher dropdown.

## Getting Started

1. Copy `.env.sample` to `.env` and set your GitHub token:
   ```
   GH_TOKEN=your_github_token_here
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Integration with AI Hack Studio

The playground at `src/playground` links to this app. Set `VITE_WEBBUILDER_URL` in the playground's `.env` to point to this app's URL.
