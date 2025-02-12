import { Pool } from 'pg';

// Charger dotenv de manière synchrone si en développement
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config(); // Utilisation de require pour charger dotenv synchroniquement
}

console.log("DB_USER:", process.env.DB_USER);
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_DATABASE:", process.env.DB_DATABASE);
console.log("DB_PORT:", process.env.DB_PORT);

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

const query = async (text: string, params?: any[]) => {
  const res = await pool.query(text, params);
  return res.rows;
};

export { query };
