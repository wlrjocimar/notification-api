import express from "express";
//import mongoose from "mongoose";
import dotenv from "dotenv";
const secureRoutes = express.Router();
import path from "path";
import { fileURLToPath } from 'url';
import notificationRouter from "./src/routes/notifications.js";
import Token from "./src/models/Token.js"
import  cors  from "cors";
const app = express();

import cookieParser from "cookie-parser";
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));

import admin from 'firebase-admin'; // Certifique-se de ter o pacote 'firebase-admin' instalado





app.use(cors("*"));
app.use(cookieParser()); 



admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});



dotenv.config();


// To resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basePath = '/notification-api';
app.use(express.json());

app.use(express.static('public'));

// mongoose.connect(process.env.MONGO_URL)
//     .then(() => {
//         console.log("DBConnection successful!!");
//     })
//     .then(() => {
//         console.log("If connection successful then I run");
//     })
//     .catch((error) => {
//         console.log("Authentication Failed!!", error);
//     });

// Route to serve the HTML file
secureRoutes.get('/swagger', function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


secureRoutes.use("/",notificationRouter);

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
  console.log("Chegamos");
  const { title, body, tokens } = req.body;

  if (!title || !body || !tokens || !Array.isArray(tokens)) {
    return res.status(400).send('Título, corpo da notificação e tokens dos dispositivos são obrigatórios');
  }

  const message = {
    notification: {
      title,
      body,
    },
    tokens: tokens,
    android: {
      priority: 'high',
      ttl: 2419200,
    },
    apns: {
      payload: {
        aps: {
          contentAvailable: true,
          mutableContent: true,
        },
      },
      headers: {
        'apns-priority': '10',
        'apns-expiration': `${Math.floor(Date.now() / 1000) + 2419200}`,
      },
    },
    webpush: {
      headers: {
        TTL: '2419200',
      },
    },
  };
  

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log('Notificações enviadas com sucesso:', response);

    // Verifica se houve falhas no envio
    if (response.failureCount > 0) {
      const errors = response.responses
        .filter(r => !r.success)
        .map((r, index) => ({
          token: tokens[index],
          error: r.error.message || 'Erro desconhecido',
        }));

      console.error('Falhas no envio das notificações:', errors);
      return res.status(500).json({ message: 'Algumas notificações não foram enviadas.', errors });
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Erro ao enviar notificações:', error);
    res.status(500).send(`Erro ao enviar notificações: ${error.message}`);
  }
});





// Rota para registrar dispositivos

secureRoutes.post('/register-device',async (req, res) => {
  const { userId, fcmToken } = req.body;
  console.log("Chegamos!!")

  if (!fcmToken) {
    return res.status(400).send('Token FCM não informado');
  }

  if (!userId) {
    return res.status(400).send('User ID não informado');
  }

  try {
    // Verifica se o token já está registrado
    const existingToken = await Token.findOne({ userId });

    if (existingToken) {
      // Atualiza o token existente
      existingToken.fcmToken = fcmToken;
      await existingToken.save();
      console.log(`Dispositivo atualizado: ${fcmToken}`);
      return res.status(200).send('Token atualizado com sucesso');
    } else {
      // Cria um novo token
      const newToken = new Token({ userId, fcmToken });
      await newToken.save();
      console.log(`Dispositivo registrado: ${fcmToken}`);
      return res.status(200).send('Dispositivo registrado com sucesso');
    }
  } catch (error) {
    console.error('Erro ao registrar o dispositivo:', error);
    return res.status(500).send('Erro ao registrar o dispositivo');
  }
  });
  




secureRoutes.get('/test', function(req, res) {
    res.status(200).json({ "retorno": "resposta ok" });
});


app.use(basePath,secureRoutes);

app.listen(3001, () => {
    console.log("Connected to backend");
});
