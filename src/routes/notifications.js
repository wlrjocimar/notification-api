import express from "express";
import axios from "axios";
import https from "https";

const router = express.Router();

// Rota para fazer requisições externas
router.post("/make-request", async (req, res) => {
    const { url, method, body } = req.body;

      // Acesse os cookies disponíveis no domínio
      const cookies = req.cookies;
      console.log("Cookies disponíveis:", cookies);

       // Obtém todos os cabeçalhos que vieram do front
    const headers = { ...req.headers };
    // Remover cabeçalhos indesejados
    delete headers.host;
    delete headers['content-length'];
    delete headers.connection;

    console.log("Fazendo requisição para:", url);
    console.log("Método:", method);
    console.log("Cabeçalhos:", headers);

    try {
        const response = await axios({
            url,
            method,
            data: body,
            headers: {
                ...headers, // Inclui todos os cabeçalhos do front-end
                "Content-Type": "application/json", // Garante que o tipo de conteúdo seja JSON
                "Cache-Control": "no-cache",
                ...(cookies ? { Cookie: Object.entries(cookies).map(([key, value]) => `${key}=${value}`).join('; ') } : {}),
            },
            withCredentials: true, // Inclui cookies e autenticação
            httpsAgent: new https.Agent({
                rejectUnauthorized: false, // Ignorar verificação do certificado (se necessário)
            }),
        });

        // Verifique os cookies na resposta
       // console.log('Cabeçalhos de Resposta:', response.headers);
        if (response.headers['set-cookie']) {
           // console.log('Cookies recebidos:', response.headers['set-cookie']);
            // Repassar o cookie para o cliente
            response.headers['set-cookie'].forEach(cookie => {
                res.append('Set-Cookie', cookie);
            });
        }

        res.status(response.status).json(response.data);
    } catch (error) {
       // console.error("Erro na requisição:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
