# GlobeHackathons
An autonomous AI agent that searches the web daily to find, filter, and notify developers about the most relevant hackathons using personalized preferences and 3D visualization
<img width="1486" height="965" alt="image" src="https://github.com/user-attachments/assets/3aa38958-4dd8-4ff0-9ba8-93d59a76d42a" />
<img width="1082" height="614" alt="image" src="https://github.com/user-attachments/assets/5845edba-b29f-48c9-a65a-0203cfc6eec9" />
 HackAgent AI — Global Hackathon Discovery Platform

HackAgent AI is an intelligent AI-powered application that automatically searches, filters, and tracks global hackathons based on a user’s skills, location preferences, and reward interests.
Instead of manually searching across multiple websites, HackAgent AI acts as a persistent agent that discovers hackathons once, stores them permanently, and never searches the same event again until it ends.

The platform uses a 3D globe-based interface with animated notifications to make hackathon discovery visual, interactive, and intuitive.

✨ Key Features

- Personalized Discovery
Users define their skills, preferred categories, locations, and reward types.

- AI-Powered Search Agent
Automatically searches Google for hackathons using structured prompts and validates results.

- Persistent Registry (No Duplicate Searches)
Once a hackathon is discovered and stored, it is never searched again until it expires.

- 3D Globe Visualization
Hackathons are displayed on an interactive world globe with country borders and location markers.

- 3D Animated Notifications
High-value hackathons trigger visual alerts instead of noisy popups.

- SQLite Local Database
Stores all discovered hackathons and user preferences.

- AI Fit Score & Vetting Pipeline
Each hackathon is scored based on how well it matches the user’s skills and interests.

- Registry View
Users can view all stored hackathons, delete expired ones, and track participation history.

- Tech Stack

Frontend: React.js, TypeScript

3D Visualization: Three.js, React Three Fiber, React-Globe.gl

AI Agent Protocol: #LeanMCP

AI Model & Reasoning: Comet API

Search Grounding: Google Search (via AI agent)

Database: SQLite

Model Training / Hosting: Novita GPU

📂 Project Structure
src/
├── components/
│   ├── GlobeView.tsx        # 3D globe visualization
│   ├── Notification3D.tsx  # Animated alerts
│   ├── DatabaseView.tsx    # Registry view
│
├── services/
│   ├── geminiService.ts    # AI search & extraction logic
│
├── types.ts                # Shared TypeScript types
├── App.tsx                 # Main application logic
├── index.tsx               # App entry point
└── index.html              # Import maps & dependencies

⚙️ How the System Works

The user configures skills, location, category, and reward preferences.

The AI agent searches Google for hackathons using LeanMCP tools.

Extracted data is validated and scored using the Comet API.

New hackathons are stored in SQLite and shown on the globe.

Existing hackathons are reused from the registry without re-searching.

Hackathons remain visible until they expire or are manually removed.

🚀 How to Run the Project Locally
1️⃣ Clone the Repository
git clone https://github.com/your-username/hackagent-ai.git
cd hackagent-ai

2️⃣ Install Dependencies
npm install

3️⃣ Set Environment Variables

Create a .env file in the root directory:

VITE_COMET_API_KEY=your_comet_api_key_here
VITE_GOOGLE_SEARCH_KEY=your_google_search_key_here


⚠️ Do not commit this file to GitHub.

4️⃣ Run the Development Server
npm run dev


The app will be available at:

http://localhost:5173

* Database Behavior (Important)

Hackathons are stored locally in SQLite / browser storage

Once discovered, they are never searched again

Data persists until:

The hackathon ends

Or the user manually deletes it from the registry

*Security Notes

API keys are never hardcoded

All secrets are managed through environment variables

Safe to publish the frontend without exposing keys

* Future Improvements

Cloud-synced database (multi-user support)

Team formation visualization on the globe

Calendar sync & reminders

Collaborative hackathon recommendations

* Conclusion

HackAgent AI turns hackathon discovery into a persistent, intelligent, and visual experience, helping developers focus on building instead of searching.

Discover smarter. Build faster. Compete globally.
