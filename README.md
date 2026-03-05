# AI Agile Sprint Planner

AI Agile Sprint Planner is an intelligent project management tool that automatically transforms unstructured requirements into a comprehensive Agile sprint plan. Powered by FastAPI, CrewAI, and Groq's Llama 3.3 model, it generates user stories, assigns story points, and designs API architectures in seconds. This greatly reduces planning time and accelerates the development process for developers and project managers.

## Features
- **Automated Sprint Planning**: Instantly break down project descriptions into actionable tasks.
- **Smart Estimation**: Assigns story points based on task complexity.
- **Architecture & API Design**: Generates technical plans including API routes and dependencies.

## Tech Stack
- **Frontend**: React.js, Vite
- **Backend**: Python, FastAPI, CrewAI, Groq API (Llama 3.3)

## Setup Instructions

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Mac/Linux
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file and add your Groq API key:
   ```env
   GROQ_API_KEY=your_api_key_here
   ```
5. Run the server (runs on `http://127.0.0.1:8000` by default):
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
