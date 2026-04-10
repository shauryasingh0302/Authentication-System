import express from "express"
import cors from "cors"
import 'dotenv/config'
import cookieParser from "cookie-parser"
import connectDB from "./config/mongodb.js"
import authRouter from "./routes/auth.routes.js"
import userRouter from "./routes/user.routes.js"

const app = express()

const allowedOrigins = [
    'http://localhost:5173',
    process.env.FRONTEND_URL,
].filter(Boolean)

connectDB()

app.use(express.json())
app.use(cookieParser())
app.use(cors({origin: allowedOrigins, credentials: true}))

app.get('/',(req,res)=>{
    res.send("API working")
})

app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)  

app.listen(process.env.PORT || 4000, ()=>{
    console.log(`Server started on PORT:${process.env.PORT || 4000}`)
})