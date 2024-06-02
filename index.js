import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
const secureRoutes = express.Router();
import path from "path";
import { fileURLToPath } from 'url';
import notificationRouter from "./src/routes/notifications.js";

dotenv.config();
const app = express();

// To resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basePath = '/notification-api';
app.use(express.json());

app.use(express.static('public'));

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("DBConnection successful!!");
    })
    .then(() => {
        console.log("If connection successful then I run");
    })
    .catch((error) => {
        console.log("Authentication Failed!!", error);
    });

// Route to serve the HTML file
secureRoutes.get('/swagger', function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

secureRoutes.post('/cadastrar', function(req, res) {
    console.log(req.body);
    res.status(200).json({ "retorno": "mensagem retorno" });
});

secureRoutes.get('/test', function(req, res) {
    res.status(200).json({ "retorno": "resposta ok" });
});


app.use(basePath,secureRoutes);

app.listen(3001, () => {
    console.log("Connected to backend");
});
