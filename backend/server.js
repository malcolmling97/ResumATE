import "dotenv/config.js" // automatically loads .env
import express from "express"
import cors from "cors"
import cookies from "cookie-parser"
import session from "express-session"
import passport from "./config/passport.js"

import userRoutes from "./routes/auth.route.js"
import educationRoutes from "./routes/education.route.js"
import skillsRoutes from "./routes/skills.route.js"
import resumeItemsRoutes from "./routes/resumeItems.route.js"
import resumeRoutes from "./routes/resume.route.js"

const app = express()

app.use(cors({
    credentials: true,
    origin: [process.env.CLIENT_URL],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE"
}))
app.use(express.json())
app.use(cookies())

app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}))

app.use(passport.initialize())
app.use(passport.session())

app.use("/api/v1/auth", userRoutes)
app.use("/api/v1/education", educationRoutes)
app.use("/api/v1/skills", skillsRoutes)
app.use("/api/v1/resume-items", resumeItemsRoutes)
app.use("/api/v1/resume", resumeRoutes)


try {
    const port = process.env.PORT
    app.listen(port, () => {
        console.log(`server is up and listening on port ${port}`)
    })
}
catch (err) {
    console.log(err)
}