import express from "express"
import cors from "cors"
import 'dotenv/config'
import cookieParser from "cookie-parser"
import connectDB from "./config/mongodb.js"
import authRouter from "./routes/auth.routes.js"
import userRouter from "./routes/user.routes.js"

const app = express()

const explicitOrigins = [
    'http://localhost:5173',
    process.env.FRONTEND_URL,
].filter(Boolean)

const corsOptions = {
    origin: (origin, callback) => {
        // Allow non-browser tools (curl/postman) that do not send Origin.
        if (!origin) return callback(null, true)

        const isExplicitlyAllowed = explicitOrigins.includes(origin)
        const isRenderFrontend = /^https:\/\/[a-z0-9-]+\.onrender\.com$/i.test(origin)

        if (isExplicitlyAllowed || isRenderFrontend) {
            return callback(null, true)
        }

        return callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
}

connectDB()

app.use(express.json())
app.use(cookieParser())
app.use(cors(corsOptions))

app.get('/',(req,res)=>{
    res.send("API working")
})

app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)  

app.listen(process.env.PORT || 4000, ()=>{
    console.log(`Server started on PORT:${process.env.PORT || 4000}`)
})