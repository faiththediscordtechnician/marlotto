import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './db.js';
import routes from './routes.js';
import { scrapeReddit, scrapeTwitter } from './scrapers.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/', routes);

// ===== SCRAPER ROUTES =====
app.post('/api/scrape/reddit', async (req, res) => {
  try {
    const result = await scrapeReddit();
    res.json(result);
  } catch (err) {
    console.error('Scraper error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/scrape/twitter', async (req, res) => {
  try {
    const result = await scrapeTwitter();
    res.json(result);
  } catch (err) {
    console.error('Scraper error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/scrape/all', async (req, res) => {
  try {
    const reddit = await scrapeReddit();
    const twitter = await scrapeTwitter();
    res.json({
      reddit,
      twitter,
      total_added: reddit.added + twitter.added,
    });
  } catch (err) {
    console.error('Scraper error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
