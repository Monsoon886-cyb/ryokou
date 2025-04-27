const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log(err, err.message);
  console.log('UNCAUGHT EXCEPTION 💣💣💥 shutting down');

  process.exit(1);
});

const server = require('./app');

dotenv.config({ path: './config.env' });

const port = 8001;

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB is connected'));

const serverM = server.listen(port, () => {
  console.log(
    `Yo omae wa ryokou da kore kara motto ore no jinsei oo kaeru koto ni naru 🎎🎏🎴🍙 koko ${port}`
  );
});

process.on('unhandledRejection', (err) => {
  // console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! ✈️🏢🏢💥💥 Shutting down', err);
  serverM.close(() => {
    process.exit(1);
  });
});
