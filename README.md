# YT-GENAI 🚀
### AI-Powered Interview Preparation & Resume Generator

YT-GENAI is a full-stack web application designed to help job seekers prepare for interviews and create professional resumes using AI. Users can submit their resume, job description, and self-description to generate personalized interview preparation reports and downloadable resume PDFs.

## ✨ Features

- **AI Interview Preparation:** Generate interview questions tailored to a job description and resume.
- **Resume Analysis:** Identify skill gaps and areas for improvement.
- **Personalized Preparation Plan:** Get a structured plan to prepare for interviews.
- **Resume PDF Generator:** Generate and download a resume in PDF format.
- **User Authentication:** Register and log in to access personalized reports.
- **Interview Report Management:** Generate and access saved interview reports.

## 🛠️ Tech Stack

**Frontend**
- React.js
- Vite
- Axios

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

**AI & Tools**
- Google Gemini API
- Puppeteer
- Git and GitHub

**Deployment**
- Vercel — Frontend
- Render — Backend
- MongoDB Atlas — Database

## ⚙️ Getting Started

### Prerequisites
- Node.js and npm
- MongoDB Atlas account or a MongoDB instance
- Google Gemini API key

### 1. Clone the repository

```bash
git clone https://github.com/Dipanshu9956/YT-GENAI.git
cd YT-GENAI
```

### 2. Set up the backend

```bash
cd Backend
npm install
```

Create a `.env` file inside the `Backend` directory:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_GENAI_API_KEY=your_gemini_api_key
```

Start the backend:

```bash
npm run dev
```

### 3. Set up the frontend

Open another terminal:

```bash
cd Frontend
npm install
```

Create a `.env` file inside the `Frontend` directory:

```env
VITE_API_URL=http://localhost:3000
```

Start the frontend:

```bash
npm run dev
```

Open the local URL shown in your terminal.

## 🌐 Live Demo

- **Frontend:** https://yt-genai-snowy.vercel.app/
- **Backend API:** https://yt-genai-xihf.onrender.com

> Note: The backend may take some time to respond after a period of inactivity on the free hosting plan.

## 🔐 Environment Variables

Never commit `.env` files, passwords, database credentials, or API keys to GitHub. Configure production environment variables through the respective hosting dashboards.

## 👨‍💻 Author

**Dipanshu Prasad**

- GitHub: [@Dipanshu9956](https://github.com/Dipanshu9956)

---

If you find this project useful, consider giving the repository a ⭐.
