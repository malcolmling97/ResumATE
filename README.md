# 🚀 ResumATE

**Project:** ResumATE  
**Event:** Cursor Hackathon Singapore 2025 (24 hours)  
**Technologies:** React, TailwindCSS, ShadCN UI, NodeJS, ExpressJS, FastAPI, OpenAI Agents SDK, PostgreSQL  

---

## 🌟 Overview

We participated at Cursor Hackathon Singapore 2025, https://www.straitstimes.com/tech/programmers-assemble-400-compete-in-24-hour-hackathon-by-ai-firms-like-cursor-openai over the weekend to create ResumATE,  a web application create to solve the painful process of tailoring resumes to a job.  

Usually job seekers have a master resume with all their listed experiences. They painstakeningly curate relevant points based on job descriptions, to create a tailored resume. This can take significant time and effort when one has to apply to many jobs.  

To solve this, ResumATE uses AI to intelligently select and reorganize experiences, while giving users the ability to instantly tweak and finalize their resume with the end goal to to save time, reduce stress, and make applying for jobs smarter and faster.

---

## 🎯 Features

- **Feature 1:** Google oauth 2.0 authentication.  
- **Feature 2:** Automated resume generation from user's collection of experiences, projects and etc.  
- **Feature 3:** Easy and instantanous access to customize tailored resume.  
- **Feature 4:** AI analyzer to give user feedback on tailored resume.  

---

## 🛠 Tech Stack

- **Frontend:** React, Next.js, TailwindCSS, ShadCN UI 
- **Backend:** NodeJS ExpressJS, FastAPI  
- **Database:** PostgreSQL (Supabase)
- **APIs / Integrations:** SwaggerUI 
- **AI / ML:** OpenAI Agents SDK

---

## 📸 Screenshots / Demo

To be added

---

## 🚀 Installation & Setup

### 1. Clone the repository  
```bash
git clone https://github.com/malcolmling97/ResumATE.git
cd ResumATE
```

### 2. Set up frontend
Install npm packages
```bash
cd frontend
npm install
```
Add the `.env` file in frontend folder with the following contents.
```
VITE_BACKEND_URL=http://localhost:3000
VITE_FASTAPI_URL=http://localhost:8000
```

### 3. Set up NodeJS backend
Install npm packages
```bash
cd backend
npm install
```
Add the `.env` file in backend folder with the following contents.
```
PORT=3000
JWT_SECRET=[your-secret]
SESSION_SECRET=[your-secret]
GOOGLE_CLIENT_ID=[your-secret]
GOOGLE_CLIENT_SECRET=[your-secret]
CLIENT_URL=http://localhost:5173
DB_URL=[your-secret]
FASTAPI_URL=http://localhost:8000
```

### 4. Install python packages for FastAPI backend using [uv](https://docs.astral.sh/uv/getting-started/installation/)
```bash
cd backend_python
```
Create virtual environment
```
uv venv .venv
```
Activate it
for Windows
```
.venv\Scripts\activate
```
for macOS/Linux
```
source .venv/bin/activate
```
Install dependencies
```
uv sync
```
Add the `.env` file in the backend_python folder with the following contents.
```
SUPABASE_URL=[your]
SUPABASE_KEY=[your]
HOST=127.0.0.1
PORT=8000
OPENAI_API_KEY=[your]
```

## Running in development

### 1. Start the frontend
```bash
cd frontend
npm run dev
```

### 2. Start the NodeJS server
```bash
cd backend
npm run dev
```

### 3. Start FastAPI server
```bash
cd backend_python
uv run python main.py
```

