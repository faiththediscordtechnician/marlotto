import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export async function query(text, params) {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  }
}

export async function initializeDatabase() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS sweepstakes (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      prize_value INT,
      deadline DATE NOT NULL,
      mail_address_street VARCHAR(255),
      mail_address_city VARCHAR(100),
      mail_address_state VARCHAR(2),
      mail_address_zip VARCHAR(10),
      instructions TEXT,
      status VARCHAR(50) DEFAULT 'not_started',
      status_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      notes TEXT
    );
  `;

  try {
    await query(createTableSQL);
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  }
}

export default pool;
