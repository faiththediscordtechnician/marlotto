import axios from 'axios';
import { query } from '../db.js';

const REDDIT_API = 'https://www.reddit.com/r/sweepstakes/new.json';

export async function scrapeReddit() {
  try {
    console.log('Starting Reddit scrape...');

    const response = await axios.get(REDDIT_API, {
      headers: {
        'User-Agent': 'Marlotto-Sweepstakes-Bot/1.0',
      },
      timeout: 10000,
    });

    const posts = response.data.data.children;
    let added = 0;
    let skipped = 0;

    for (const post of posts) {
      const {
        title,
        url,
        created_utc,
        selftext,
      } = post.data;

      if (!title || !url || url === 'https://www.reddit.com/r/sweepstakes/comments/x/') {
        skipped++;
        continue;
      }

      try {
        // Extract deadline from title if possible
        const deadlineMatch = title.match(/\[(\d{1,2}\/\d{1,2})\]|\b(\d{4})\b/);
        const deadline = new Date(created_utc * 1000 + 30 * 24 * 60 * 60 * 1000);

        // Check if already exists
        const existing = await query('SELECT id FROM sweepstakes WHERE url = $1', [url]);
        if (existing.rows.length > 0) {
          skipped++;
          continue;
        }

        // Parse prize value from title
        const prizeMatch = title.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
        const prize_value = prizeMatch ? parseInt(prizeMatch[1].replace(/,/g, '')) : null;

        await query(
          `INSERT INTO sweepstakes
           (name, url, prize_value, deadline, source, entry_type, instructions)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            title,
            url,
            prize_value,
            deadline,
            'reddit',
            'email_form',
            selftext || null,
          ]
        );

        added++;
      } catch (err) {
        if (err.code !== '23505') { // Ignore unique constraint
          console.error('Error inserting sweepstake:', err);
        }
        skipped++;
      }
    }

    console.log(`Reddit scrape complete: ${added} added, ${skipped} skipped`);
    return { added, skipped };
  } catch (err) {
    console.error('Reddit scrape error:', err.message);
    throw new Error('Failed to scrape Reddit');
  }
}

export async function scrapeTwitter() {
  try {
    console.log('Twitter scraper: Not yet implemented (requires API key)');
    return { added: 0, skipped: 0 };
  } catch (err) {
    console.error('Twitter scrape error:', err);
    throw err;
  }
}
