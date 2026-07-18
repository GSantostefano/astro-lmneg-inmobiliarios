const app = require('./src/app');

const PORT = process.env.BACK_PORT || 3020;

app.listen(PORT, () => {
  console.log(`LM Negocios Inmobiliarios API listening on port ${PORT}`);
});
