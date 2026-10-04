# 🚀 CleverBook 

> **An AI-powered, adaptive learning platform built for the Bits n Build Hackathon.**

CleverBook is a full-stack educational application designed to diagnose cognitive misconceptions and provide personalized learning paths. By leveraging the Google Gemini API, CleverBook acts as an intelligent AI Tutor that adapts to whether a user is in School or College, tracking their syllabus progress in real-time.

---

## 🔗 Live Links

- **Frontend (Live App):** [https://clever-ai-full-stack.vercel.app](https://clever-ai-full-stack.vercel.app)
- **Backend API (Swagger Docs):** [https://cleverbook-backend.onrender.com/docs](https://cleverbook-backend.onrender.com/docs)

---

## 🏆 Hackathon Context
This project was conceptualized and developed for the **Bits n Build** hackathon. Our goal was to create a production-ready, highly interactive, and scalable AI application that solves real-world educational challenges through cognitive diagnosis.

---

## ✨ Key Features

- **🧠 AI Tutor Diagnosis:** Integrates Google's Gemini API to analyze user responses and detect underlying cognitive misconceptions, rather than just marking answers right or wrong.
- **📊 Adaptive Syllabus Tracking:** Dynamic progress tracking customized for different educational tiers (School vs. College).
- **🎨 Highly Interactive UI/UX:** Built with Framer Motion, featuring smooth state transitions, infinite marquee effects, and an interactive avatar review carousel.
- **🔐 Secure Authentication:** JWT-based authentication with Bcrypt password hashing.
- **⚡ Split-Architecture Deployment:** Optimized cloud deployment using Vercel for lightning-fast frontend delivery and Render for uninterrupted AI backend processing (bypassing serverless timeout limits).

---

## 💻 Tech Stack

### Frontend (User Interface)
* **Framework:** Next.js (App Router, Turbopack)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Animations:** Framer Motion
* **Deployment:** Vercel

### Backend (API & AI Processing)
* **Framework:** FastAPI (Python)
* **AI Integration:** Google Gemini API
* **Authentication:** PyJWT, Passlib (Bcrypt)
* **Deployment:** Render (Web Service)

### Database
* **Database:** MongoDB Atlas (NoSQL)
* **Driver:** Motor (Asynchronous Python driver for MongoDB)

---

## ⚙️ Local Development Setup

This project is structured as a monorepo containing both the frontend and backend. 

### Prerequisites
- Node.js (v18+)
- Python (3.9+)
- MongoDB Atlas Account
- Google Gemini API Key

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/CleverAI-FullStack.git
cd CleverAI-FullStack
```

### 2. Backend Setup
```bash
cd backend
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create a .env file in the backend directory
# Add the following:
# MONGODB_URI=mongodb+srv://<user>:<password>@cluster.../cleverbook
# GEMINI_API_KEY=your_gemini_api_key
# JWT_SECRET=your_jwt_secret

# Start the FastAPI server
uvicorn app.main:app --reload
```
*The backend will run at `http://localhost:8000`*

### 3. Frontend Setup
Open a new terminal window and navigate back to the root directory.
```bash
cd cleverbook

# Install dependencies (use legacy-peer-deps to avoid React version conflicts)
npm install --legacy-peer-deps

# Create a .env.local file in the cleverbook directory
# Add the following:
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Start the Next.js development server
npm run dev
```
*The frontend will run at `http://localhost:3000`*

---

## 🚀 Deployment Architecture

To ensure the Gemini AI has sufficient time to process complex educational queries without hitting serverless timeout restrictions, this monorepo utilizes a split deployment strategy:
1. **Frontend:** Deployed natively on **Vercel** (`/cleverbook` as root).
2. **Backend:** Deployed as a continuous Web Service on **Render** (`/backend` as root), with CORS configured to complete the secure handshake with the Vercel domain.

---
*Built with ❤️ for Bits n Build.*