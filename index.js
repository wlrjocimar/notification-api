import express from "express";
const app = express();
const router = express.Router();
import mongoose  from "mongoose";
import dotenv from "dotenv"

dotenv.config();
app.use(express.static('public'))

mongoose.connect(process.env.MONGO_URL)
.then(()=>{
    console.log("DBConnection successfull!!")
}).then(()=>{
    console.log("If connection successful then i run")
}).catch((error)=>{
    console.log("Authenticated Failed!!", error)
})









app.listen(3001,()=>{
    console.log("Connected to backend");
})