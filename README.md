# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
🤖 Gemini Clone

A modern AI chat application inspired by Google Gemini, built using React, Vite, Firebase, and the Google Gemini API. This project provides real-time AI responses with a clean and responsive user interface.

🚀 Features
💬 Real-time AI chat using Gemini API
🔐 Firebase Authentication (Login/Signup support)
⚡ Fast performance with Vite
🎨 Clean and responsive UI
🧠 Smart AI responses powered by Google Gemini
🌐 Modern frontend architecture (React-based)
🛠️ Tech Stack
Frontend: React + Vite
Backend Services: Firebase
AI Model: Google Gemini API
Styling: CSS / Tailwind (if used)
📁 Project Setup
1. Clone the repository
git clone https://github.com/Rehman481/Gemini-Clone.git
cd Gemini-Clone
2. Install dependencies
npm install
3. Create .env file in root directory
VITE_GEMINI_API_KEY=your_gemini_api_key

VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
4. Run the project
npm run dev
