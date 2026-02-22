<img width="1701" height="889" alt="image" src="https://github.com/user-attachments/assets/b4915a69-ecbf-4571-b064-78e7d70daf4e" />
# 🌍 Global Hackathon Explorer

A stunning 3D interactive globe that visualizes major upcoming hackathons around the world, powered by Google Gemini AI. Explore events in real time, see your location on the globe, and get AI-curated hackathon data — all rendered in a cinematic, space-grade interface.

---

## ✨ Features

- **Interactive 3D Globe** — Built with Three.js and React Three Fiber for a high-fidelity satellite render experience
- **AI-Powered Data** — Uses Google Gemini to discover and surface global hackathon events
- **Geolocation Support** — Automatically detects and pins your location on the globe
- **Rich Event Details** — View hackathon name, location, date, status (open/virtual), description, and registration link
- **Cinematic HUD UI** — Sleek sidebar with live status indicators, blur effects, and smooth animations
- **Virtual & In-Person** — Clearly distinguishes between online and physical events

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| 3D Rendering | Three.js, @react-three/fiber, @react-three/drei |
| AI Integration | Google Gemini API (`@google/genai`) |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Build Tool | Vite |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd global-hackathon-explorer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Open `.env.local` and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

---

## 📁 Project Structure

```
├── App.tsx               # Root component — layout, state, sidebar HUD
├── index.tsx             # React entry point
├── index.html            # HTML shell with import maps
├── types.ts              # TypeScript interfaces (Hackathon, GlobeState, etc.)
├── vite.config.ts        # Vite config with env variable injection
├── tsconfig.json         # TypeScript compiler options
├── package.json          # Dependencies and scripts
├── .env.local            # Local environment variables (not committed)
├── components/
│   └── GlobeComponent    # 3D globe scene (Three.js / R3F)
└── services/
    └── geminiService     # Gemini API integration for hackathon data
```

---

## 📦 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local development server on port 3000 |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |

---

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Your Google Gemini API key |

> **Note:** Never commit your `.env.local` file. It is already included in `.gitignore`.

---

## 🌐 How It Works

1. On load, the app requests the user's geolocation (optional) and pins it on the globe.
2. A call is made to the Gemini API via `geminiService`, which returns a curated list of global hackathons with coordinates, dates, descriptions, and URLs.
3. Hackathon nodes are rendered as interactive markers on the 3D globe.
4. Selecting a hackathon in the sidebar flies the camera to that location and shows event details.

---

## 📄 License

This project is private. All rights reserved.
