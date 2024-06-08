import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
const secureRoutes = express.Router();
import path from "path";
import { fileURLToPath } from 'url';
import notificationRouter from "./src/routes/notifications.js";


import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));

import admin from 'firebase-admin'; // Certifique-se de ter o pacote 'firebase-admin' instalado



admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});



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
    // Verificar se o tipo de conteúdo da solicitação é JSON
    if (req.is('json')) {
        console.log(req.body);
        res.status(200).json({ "retorno": "mensagem retorno" });
    } else {
        // Se não for JSON, enviar uma mensagem de erro
        res.status(400).json({ "erro": "A solicitação deve ser enviada como JSON" });
    }
});




secureRoutes.post('/send-notification', async (req, res) => {
    console.log("Chegamos")
    const { title, body } = req.body;

    console.log("Body",req.body)
  
    if (!title || !body ) {
      return res.status(400).send('Título, corpo da notificação e tokens dos dispositivos são obrigatórios');
    }
  
    const message = {
      notification: {
        title,
        body,
      },
      tokens: ["dCJHCnTTT92BbGmHPTJvgW:APA91bFFQM8vNia8TbQsiySQ0Ud0xbc962t_CCE-oNrOM5vI6cTMq_CBlomjU9incX94nfoqFnHt5s4CPR8dmNbPSAMspFxDtQT_lCTyBzyKgN3ltocTPZL0jmx6SHXDzPdVhsiUPQB3"]
    };
      
  
    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      console.log('Notificações enviadas com sucesso:', response);
      res.status(200).json(response);
    } catch (error) {
      console.error('Erro ao enviar notificações:', error);
      res.status(500).send('Erro ao enviar notificações');
    }
  });
  


const registeredDevices = ["dkkKgRZuQpm8iHywbl9IJj:APA91bG1CnClGUG_jL3smbpyDfVoLE8Pa_5dKBq5hkDf9bv0kjaK2A6xTaBiKo1LWOQPX0L3yvBeSfqSl_AV-IeCUhjDCorn-SS5hVHBZAFTYOe-Fk2Ujpirx-0iG6jJDhlwymQEJcKr"];

// Rota para registrar dispositivos
// Rota para registrar dispositivos , vamos usar os tokens do lado do cliente gerado com expo para regitrar
secureRoutes.post('/register-device', (req, res) => {
    const { expoPushToken } = req.body;
    if (expoPushToken) {
      // Armazena o expoPushToken em seu banco de dados ou em algum outro tipo de armazenamento
      console.log(`Dispositivo registrado: ${expoPushToken}`);
      res.status(200).send('Dispositivo registrado com sucesso');
    } else {
      res.status(400).send('Expo Push Token não fornecido');
    }
  });
  




secureRoutes.get('/test', function(req, res) {
    res.status(200).json({ "retorno": "resposta ok" });
});


app.use(basePath,secureRoutes);

app.listen(3001, () => {
    console.log("Connected to backend");
});
