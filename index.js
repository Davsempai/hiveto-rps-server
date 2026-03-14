const express = require('express');
const cors = require('cors');
const { Client, PrivateKey } = require('@hiveio/dhive');

const app = express();
app.use(cors());
app.use(express.json());

const client = new Client(['https://api.hive.blog', 'https://api.hivekings.com']);
const ESCROW_ACCOUNT = process.env.HIVETO_ACCOUNT; // "hiveto"
const ACTIVE_KEY = process.env.HIVETO_ACTIVE_KEY;  // tu clave activa
const API_SECRET = process.env.API_SECRET;          // una contraseña que tú eliges

// Middleware de autenticación
app.use((req, res, next) => {
  if (req.headers['x-api-secret'] !== API_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// Health check (sin auth)
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Endpoint de pago
app.post('/payout', async (req, res) => {
  const { to, amount, memo } = req.body;

  if (!to || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }

  const amountStr = parseFloat(amount).toFixed(3) + ' HIVE';

  const tx = await client.broadcast.transfer(
    {
      from: ESCROW_ACCOUNT,
      to,
      amount: amountStr,
      memo: memo || 'RPS Arena payout'
    },
    PrivateKey.fromString(ACTIVE_KEY)
  );

  res.json({ success: true, txId: tx.id });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
