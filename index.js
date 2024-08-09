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
          postal_code: '01002001',
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
    console.error(error);
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
      
      res.status(response.status).json(response.data);
    } catch (error) {
      console.error('Error making API request:', error.message);
      res.status(error.response ? error.response.status : 500).json({
        message: error.message,
      });
    }
  });













app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
