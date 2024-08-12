const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

app.get('/test', function(req, res) {
    const responseData = {
        message: 'This is a test endpoint',
        status: 'success',
        data: {
            exampleKey: 'exampleValue'
        }
    };
    return res.json(responseData);
});


app.post('/proxy', async (req, res) => {
  try {
    const { accessToken, cep, altura, largura, comprimento, peso } = req.body;

    // Verificar se todos os parâmetros foram fornecidos
    if (!accessToken || !cep || !altura || !largura || !comprimento || !peso) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    const response = await axios.post(
      'https://www.melhorenvio.com.br/api/v2/me/shipment/calculate',
      {
        from: {
          postal_code: '74690900',
        },
        to: {
          postal_code: cep,
        },
        package: {
          height: altura,
          width: largura,
          length: comprimento,
          weight: peso,
        },
      },
      {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Aplicação dev.dreux@gmail.com'
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    // console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




app.post('/proxy-mercado-pago-pix', async (req, res) => {
    const url = 'https://api.mercadopago.com/v1/payments';
    try {
      const response = await axios.post(url, req.body, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': req.headers['authorization'],
          'X-Idempotency-Key': req.headers['x-idempotency-key'],
        },
      });
      console.log('Received Request Body PIX:', JSON.stringify(req.body, null, 2));
      console.log('Response from Mercado Pago API:', response.data);
      res.status(response.status).json(response.data);
    } catch (error) {
      console.error('Error making API request:', error.message);
      res.status(error.response ? error.response.status : 500).json({
        message: error.message,
      });
    }
});




app.post('/proxy-card-to-token', async (req, res) => {
  try {
    // Obtenha o corpo da requisição
    const { card_number, cardholder, security_code, expiration_month, expiration_year } = req.body;
    console.log("BODY REQ TOKEN: ", req.body);
    // Obtenha a chave pública da URL
    const publicKey = req.query.public_key;
    if (!publicKey) {
      return res.status(400).json({ error: 'Public key is required' });
    }

    // Obtenha o token de acesso dos headers
    const accessToken = req.headers['authorization'];
    if (!accessToken) {
      return res.status(400).json({ error: 'Authorization header is required' });
    }

    // Prepare o payload para a chamada à API do Mercado Pago
    const payload = {
      card_number,
      cardholder,
      security_code,
      expiration_month,
      expiration_year
    };

    // Faça a chamada para a API do Mercado Pago
    const response = await axios.post(`https://api.mercadopago.com/v1/card_tokens?public_key=${publicKey}`, payload, {
      headers: {
        'Authorization': accessToken,
        'Content-Type': 'application/json'
      }
    });

    // Envie a resposta da API do Mercado Pago de volta para o cliente
    res.json(response.data);
    console.log('RESPOSTA TOKEN:', response.data);

  } catch (error) {
    // Em caso de erro, envie uma resposta de erro
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});






app.post('/proxy-mercado-pago-cc', async (req, res) => {
    // Extrair o token de acesso do cabeçalho Authorization
    const accessToken = req.headers['authorization'];
    // console.log('Received Authorization Header:', accessToken);
    if (!accessToken) {
      return res.status(400).json({ error: 'Access token is required in the Authorization header' });
    }
  
    // Corpo da requisição que será enviado para a API do Mercado Pago
    const apiRequestBody = req.body;

    console.log('Received Request Body:', JSON.stringify(apiRequestBody, null, 2));
  
    try {
      const response = await axios.post('https://api.mercadopago.com/v1/payments', apiRequestBody, {
        headers: {
          'Authorization': accessToken,
          'Content-Type': 'application/json',
        },
      });
  
    console.log('Response from Mercado Pago API:', response.data);
      // Enviar a resposta da API do Mercado Pago de volta para o cliente
      res.status(response.status).json(response.data);
    } catch (error) {
      console.error('Error making API call:', error.response ? error.response.data : error.message);
      res.status(error.response ? error.response.status : 500).json(error.response ? error.response.data : { error: 'Internal Server Error' });
    }
});





app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
