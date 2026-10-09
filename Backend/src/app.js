const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://yt-genai-snowy.vercel.app"
    ],
    credentials: true
}));

// Baaki existing middleware aur routes yahan rahenge

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")


/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)



module.exports = app