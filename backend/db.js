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
  const createTablesSQL = `
    -- Sweepstakes catalog
    CREATE TABLE IF NOT EXISTS sweepstakes (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      url VARCHAR(500) NOT NULL UNIQUE,
      prize_value INT,
      deadline TIMESTAMP NOT NULL,
      source VARCHAR(100),
      entry_type VARCHAR(50),
      difficulty_score INT DEFAULT 5,
      requires_social BOOLEAN DEFAULT FALSE,
      instructions TEXT,
      entry_url VARCHAR(500),
      date_scraped TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT TRUE,
      notes TEXT
    );

    -- User's submission tracking
    CREATE TABLE IF NOT EXISTS entries (
      id SERIAL PRIMARY KEY,
      sweepstake_id INT NOT NULL REFERENCES sweepstakes(id),
      submitted_at TIMESTAMP,
      outcome VARCHAR(50) DEFAULT 'pending',
      address_used VARCHAR(20),
      time_spent_minutes INT,
      notes TEXT
    );

    -- User's personal info for auto-fill
    CREATE TABLE IF NOT EXISTS user_info (
      id SERIAL PRIMARY KEY,
      address_label VARCHAR(50),
      full_name VARCHAR(255),
      email VARCHAR(255),
      phone VARCHAR(20),
      street_address VARCHAR(255),
      city VARCHAR(100),
      state_province VARCHAR(100),
      zip_postal VARCHAR(20),
      country VARCHAR(50),
      date_of_birth DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Win tracking
    CREATE TABLE IF NOT EXISTS wins (
      id SERIAL PRIMARY KEY,
      entry_id INT NOT NULL REFERENCES entries(id),
      prize_description VARCHAR(500),
      prize_value_estimated INT,
      received_date DATE,
      notes TEXT
    );

    -- Create indexes for common queries
    CREATE INDEX IF NOT EXISTS idx_sweepstakes_deadline ON sweepstakes(deadline);
    CREATE INDEX IF NOT EXISTS idx_sweepstakes_source ON sweepstakes(source);
    CREATE INDEX IF NOT EXISTS idx_sweepstakes_is_active ON sweepstakes(is_active);
    CREATE INDEX IF NOT EXISTS idx_entries_outcome ON entries(outcome);
    CREATE INDEX IF NOT EXISTS idx_entries_sweepstake_id ON entries(sweepstake_id);
  `;

  try {
    await query(createTablesSQL);
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  }
}

export default pool;
