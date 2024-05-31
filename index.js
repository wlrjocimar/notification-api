import express from "express";
const app = express();
const secureRoutes  = express.Router();
import mongoose  from "mongoose";
import dotenv from "dotenv"
import notificationRouter from "./src/routes/notifications.js"



dotenv.config();
app.use(express.static('public'))
secureRoutes.use(express.static('public'))
const basePath = '/notification-api';
app.use(express.json());
secureRoutes.use(express.json());



mongoose.connect(process.env.MONGO_URL)
.then(()=>{
    console.log("DBConnection successfull!!")
}).then(()=>{
    console.log("If connection successful then i run")
}).catch((error)=>{
    console.log("Authenticated Failed!!", error)
})





// Rota para servir o arquivo HTML
secureRoutes.get('/', function(req, res) {
    // Não é necessário renderizar nada, apenas enviar o arquivo HTML como resposta
    res.sendFile(__dirname +  '/public/index.html');
});



secureRoutes.post('/cadastrar', function(req, res) {

    console.log(req.body)
    
    res.status(200).json({"retorno":"mensagem retorno"})
});



app.use(basePath, secureRoutes);
secureRoutes.get('/test', function(req, res) {

    
    
    res.status(200).json({"retorno":"resposta ok"})
});











app.listen(3001,()=>{
    console.log("Connected to backend");
})