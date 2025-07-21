# Customer Sentiment Watchdog

Welcome to the **Customer Sentiment Watchdog**, an AI-powered tool built by Sneha Barge and Anjali Barge for the **AI Agent Hackathon by Product Space** (July 2025). This project analyzes real-time Reddit sentiments for brands, tags emotional tones, and alerts teams to negative trends—all using a stack!

## Project Overview

This AI agent tracks public sentiment on Reddit, offering a creative pivot from traditional support channels (emails, chats, tickets) to provide broader customer experience (CX) insights. It uses Google Sheets, Zapier, the Gemini API, and Notion to deliver a live dashboard and actionable alerts.

## Features

- **Real-Time Sentiment Analysis**: Analyzes Reddit posts and tags them as positive, negative, or neutral with scores (e.g., -0.8 to 1.0) and tones (anger, delight, etc.).
- **Email Alerts**: Sends notifications for negative sentiments (score ≤ -0.5) or trend spikes (average < -0.5 over 5 posts).
- **Interactive Dashboard**: A web UI to filter and view sentiments, built with HTML and Google Apps Script.
- **Data Integration**: Syncs with Google Sheets for processing and Notion for storage.
- **Trend Detection**: Tracks a rolling average of the last 5 sentiment scores.

## Setup Instructions

### Prerequisites
- Google Account (for Google Sheets and Apps Script).
- Zapier account (free tier works).
- Gemini API key .
- Notion API token and database ID.

### Steps

1. **Google Sheets Setup**
   - Create a new Google Sheet and name the first tab “Sentiment Analysis”.
   - Add columns: `Post ID`, `Post Text`, `Sentiment`, `Source`, `Author`, `URL`, `Date`.

2. **Apps Script Configuration**
   - In Google Sheets, go to **Extensions > Apps Script**.
   - Replace the default code with `SentimentAnalyzer.gs`:
     - Update `apiKey` with your Gemini API key.
     - Update `notionToken` and `databaseId` with your Notion credentials.
   - Save and deploy as a web app:
     - Click **Deploy > New Deployment**.
     - Select **Type: Web app**, set “Who has access” to “Anyone”, and copy the web app URL.
     - Here's our live link  https://script.google.com/macros/s/AKfycbyhtEzPh_q-tQOGnuNQfGSoTHQzWwH_Q3nqwFjP7_p4DSOkPZbeEegTRftT6XbY_bI_XQ/exec

3. **Zapier Integration**
   - Create a Zap with:
     - **Trigger**: “New Post by URL” from Reddit (e.g., `r/Test_Posts`).
     - **Action**: “Create Spreadsheet Row in Google Sheets” (map fields to “Sentiment Analysis” sheet).
   - Test and turn on the Zap.

4. **Notion Setup**
   - Create a Notion database with properties: `Title`, `Post Text`, `Author`, `Source`, `Sentiment`, `URL`, `Date`.
   - Generate an API token in Notion and note your database ID.

5. **Run the Script**
   - Set a time-driven trigger in Apps Script to run `analyzeSentiment` every minute.
   - Open the web app URL to see the dashboard.

## Usage

- **Dashboard**: Visit the deployed web app URL. Filter sentiments (All, Positive, Negative, Neutral) and refresh to update data.
- **Alerts**: Check your email (e.g., `example@gmail.com`) for negative sentiment notifications.
- **Data Review**: View synced data in Google Sheets and Notion.

## Code Overview

- **`Index.html`**: The web dashboard’s frontend. Uses HTML/CSS for a responsive table and JavaScript to filter and refresh data from Google Apps Script.
- **`SentimentAnalyzer.gs`**: The backend script:
  - `analyzeSentiment`: Processes new posts, calls the Gemini API, updates sentiments, and triggers alerts.
  - `doGet`: Serves the web app.
  - `getUpdatedData` & `getFilteredData`: Handle dashboard updates.
  - `updateNotion`: Syncs data to Notion.

## Unique Aspects

- Pivoted from support tickets to Reddit for scalable CX insights.
- Built a no-code solution with free tools in just three days.
- Implemented trend analysis with a rolling average alert system.

## Limitations & Future Work

- Currently uses Reddit instead of support channels (a hackathon constraint pivot).
- Future enhancements: Integrate support tickets/chats, improve UI, and expand API features.

## Contributors

- Sneha Barge
- Anjali Barge

## License

This project is open for learning purposes during the hackathon. Feel free to explore and adapt!
