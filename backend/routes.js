import express from 'express';
import { query } from './db.js';

const router = express.Router();

// ===== SWEEPSTAKES ROUTES =====

router.get('/api/sweepstakes', async (req, res) => {
  try {
    const { source, minPrize, difficulty, status, sortBy } = req.query;
    let sql = 'SELECT * FROM sweepstakes WHERE is_active = TRUE';
    const params = [];
    let paramIndex = 1;

    if (source) {
      sql += ` AND source = $${paramIndex}`;
      params.push(source);
      paramIndex++;
    }

    if (minPrize) {
      sql += ` AND prize_value >= $${paramIndex}`;
      params.push(parseInt(minPrize));
      paramIndex++;
    }

    if (difficulty) {
      sql += ` AND difficulty_score <= $${paramIndex}`;
      params.push(parseInt(difficulty));
      paramIndex++;
    }

    if (sortBy === 'prize') {
      sql += ' ORDER BY prize_value DESC NULLS LAST';
    } else if (sortBy === 'difficulty') {
      sql += ' ORDER BY difficulty_score ASC';
    } else {
      sql += ' ORDER BY deadline ASC';
    }

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching sweepstakes:', err);
    res.status(500).json({ error: 'Failed to fetch sweepstakes' });
  }
});

router.get('/api/sweepstakes/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM sweepstakes WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sweepstake not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching sweepstake:', err);
    res.status(500).json({ error: 'Failed to fetch sweepstake' });
  }
});

router.post('/api/sweepstakes', async (req, res) => {
  try {
    const {
      name,
      url,
      prize_value,
      deadline,
      source,
      entry_type,
      difficulty_score,
      requires_social,
      instructions,
      entry_url,
      notes,
    } = req.body;

    if (!name || !url || !deadline) {
      return res.status(400).json({ error: 'Name, URL, and deadline are required' });
    }

    const sql = `
      INSERT INTO sweepstakes (
        name, url, prize_value, deadline, source, entry_type,
        difficulty_score, requires_social, instructions, entry_url, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;

    const result = await query(sql, [
      name,
      url,
      prize_value || null,
      deadline,
      source || 'manual',
      entry_type || null,
      difficulty_score || 5,
      requires_social || false,
      instructions || null,
      entry_url || url,
      notes || null,
    ]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Sweepstake with this URL already exists' });
    }
    console.error('Error creating sweepstake:', err);
    res.status(500).json({ error: 'Failed to create sweepstake' });
  }
});

router.patch('/api/sweepstakes/:id', async (req, res) => {
  try {
    const allowedFields = [
      'difficulty_score',
      'requires_social',
      'instructions',
      'notes',
      'is_active',
    ];

    const updateFields = [];
    const params = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
      if (field in req.body) {
        updateFields.push(`${field} = $${paramIndex}`);
        params.push(req.body[field]);
        paramIndex++;
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    params.push(req.params.id);
    const sql = `
      UPDATE sweepstakes
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *;
    `;

    const result = await query(sql, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sweepstake not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating sweepstake:', err);
    res.status(500).json({ error: 'Failed to update sweepstake' });
  }
});

router.delete('/api/sweepstakes/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM sweepstakes WHERE id = $1 RETURNING id;', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sweepstake not found' });
    }
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('Error deleting sweepstake:', err);
    res.status(500).json({ error: 'Failed to delete sweepstake' });
  }
});

// ===== ENTRIES ROUTES =====

router.post('/api/entries', async (req, res) => {
  try {
    const { sweepstake_id, address_used, time_spent_minutes, notes } = req.body;

    if (!sweepstake_id) {
      return res.status(400).json({ error: 'Sweepstake ID required' });
    }

    const sql = `
      INSERT INTO entries (sweepstake_id, submitted_at, address_used, time_spent_minutes, notes)
      VALUES ($1, CURRENT_TIMESTAMP, $2, $3, $4)
      RETURNING *;
    `;

    const result = await query(sql, [
      sweepstake_id,
      address_used || 'colorado',
      time_spent_minutes || null,
      notes || null,
    ]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating entry:', err);
    res.status(500).json({ error: 'Failed to create entry' });
  }
});

router.patch('/api/entries/:id', async (req, res) => {
  try {
    const allowedFields = ['outcome', 'time_spent_minutes', 'notes'];
    const updateFields = [];
    const params = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
      if (field in req.body) {
        updateFields.push(`${field} = $${paramIndex}`);
        params.push(req.body[field]);
        paramIndex++;
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    params.push(req.params.id);
    const sql = `UPDATE entries SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *;`;

    const result = await query(sql, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating entry:', err);
    res.status(500).json({ error: 'Failed to update entry' });
  }
});

router.get('/api/entries', async (req, res) => {
  try {
    const { outcome } = req.query;
    let sql = 'SELECT e.*, s.name, s.prize_value FROM entries e JOIN sweepstakes s ON e.sweepstake_id = s.id';
    const params = [];

    if (outcome) {
      sql += ' WHERE e.outcome = $1';
      params.push(outcome);
    }

    sql += ' ORDER BY e.submitted_at DESC';
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching entries:', err);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

// ===== USER INFO ROUTES =====

router.get('/api/user-info', async (req, res) => {
  try {
    const result = await query('SELECT * FROM user_info ORDER BY address_label');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching user info:', err);
    res.status(500).json({ error: 'Failed to fetch user info' });
  }
});

router.get('/api/user-info/:label', async (req, res) => {
  try {
    const result = await query('SELECT * FROM user_info WHERE address_label = $1', [req.params.label]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching user info:', err);
    res.status(500).json({ error: 'Failed to fetch user info' });
  }
});

router.post('/api/user-info', async (req, res) => {
  try {
    const {
      address_label,
      full_name,
      email,
      phone,
      street_address,
      city,
      state_province,
      zip_postal,
      country,
      date_of_birth,
    } = req.body;

    if (!address_label) {
      return res.status(400).json({ error: 'Address label required' });
    }

    const sql = `
      INSERT INTO user_info (
        address_label, full_name, email, phone, street_address,
        city, state_province, zip_postal, country, date_of_birth
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (address_label) DO UPDATE SET
        full_name = $2, email = $3, phone = $4, street_address = $5,
        city = $6, state_province = $7, zip_postal = $8, country = $9, date_of_birth = $10
      RETURNING *;
    `;

    const result = await query(sql, [
      address_label,
      full_name || null,
      email || null,
      phone || null,
      street_address || null,
      city || null,
      state_province || null,
      zip_postal || null,
      country || null,
      date_of_birth || null,
    ]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error saving user info:', err);
    res.status(500).json({ error: 'Failed to save user info' });
  }
});

// ===== STATS ROUTES =====

router.get('/api/stats', async (req, res) => {
  try {
    const [totalSweeps, submitted, wins, pending] = await Promise.all([
      query('SELECT COUNT(*) as count FROM sweepstakes WHERE is_active = TRUE'),
      query('SELECT COUNT(*) as count FROM entries WHERE outcome != "won"'),
      query('SELECT COUNT(*) as count FROM entries WHERE outcome = "won"'),
      query('SELECT COUNT(*) as count FROM entries WHERE outcome = "pending"'),
    ]);

    const prizeResult = await query(
      'SELECT COALESCE(SUM(s.prize_value), 0) as total FROM entries e JOIN sweepstakes s ON e.sweepstake_id = s.id WHERE e.outcome = "won"'
    );

    const timeResult = await query(
      'SELECT COALESCE(AVG(time_spent_minutes), 0) as avg_time FROM entries WHERE time_spent_minutes IS NOT NULL'
    );

    const weekResult = await query(
      `SELECT COUNT(*) as count FROM entries WHERE submitted_at > NOW() - INTERVAL '7 days'`
    );

    const totalSubmitted = parseInt(submitted.rows[0].count);
    const totalWins = parseInt(wins.rows[0].count);
    const winRate = totalSubmitted > 0 ? ((totalWins / totalSubmitted) * 100).toFixed(1) : 0;

    res.json({
      total_sweepstakes_available: parseInt(totalSweeps.rows[0].count),
      total_submitted: totalSubmitted,
      pending_outcomes: parseInt(pending.rows[0].count),
      wins_count: totalWins,
      win_rate_percent: parseFloat(winRate),
      total_prize_value_won: parseInt(prizeResult.rows[0].total),
      avg_time_per_entry_minutes: parseFloat(timeResult.rows[0].avg_time),
      submissions_this_week: parseInt(weekResult.rows[0].count),
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.get('/api/stats/by-source', async (req, res) => {
  try {
    const result = await query(`
      SELECT s.source, COUNT(e.id) as submissions, COUNT(CASE WHEN e.outcome = 'won' THEN 1 END) as wins
      FROM sweepstakes s
      LEFT JOIN entries e ON s.id = e.sweepstake_id
      WHERE s.is_active = TRUE
      GROUP BY s.source
      ORDER BY wins DESC;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching source stats:', err);
    res.status(500).json({ error: 'Failed to fetch source stats' });
  }
});

export default router;
