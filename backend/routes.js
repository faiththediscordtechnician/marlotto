import express from 'express';
import { query } from './db.js';

const router = express.Router();

// GET /api/sweepstakes - Fetch all sweepstakes with optional filtering and sorting
router.get('/api/sweepstakes', async (req, res) => {
  try {
    const { status, sortBy } = req.query;

    let sql = 'SELECT * FROM sweepstakes WHERE 1=1';
    const params = [];

    if (status) {
      sql += ' AND status = $' + (params.length + 1);
      params.push(status);
    }

    if (sortBy === 'deadline') {
      sql += ' ORDER BY deadline ASC';
    } else if (sortBy === 'prize') {
      sql += ' ORDER BY prize_value DESC NULLS LAST';
    } else if (sortBy === 'added') {
      sql += ' ORDER BY date_added DESC';
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

// POST /api/sweepstakes - Add a new sweepstake
router.post('/api/sweepstakes', async (req, res) => {
  try {
    const {
      name,
      prize_value,
      deadline,
      mail_address_street,
      mail_address_city,
      mail_address_state,
      mail_address_zip,
      instructions,
      notes,
    } = req.body;

    if (!name || !deadline) {
      return res.status(400).json({ error: 'Name and deadline are required' });
    }

    const sql = `
      INSERT INTO sweepstakes (
        name, prize_value, deadline, mail_address_street,
        mail_address_city, mail_address_state, mail_address_zip,
        instructions, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;

    const result = await query(sql, [
      name,
      prize_value || null,
      deadline,
      mail_address_street || null,
      mail_address_city || null,
      mail_address_state || null,
      mail_address_zip || null,
      instructions || null,
      notes || null,
    ]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating sweepstake:', err);
    res.status(500).json({ error: 'Failed to create sweepstake' });
  }
});

// PATCH /api/sweepstakes/:id - Update a sweepstake
router.patch('/api/sweepstakes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Build dynamic update query
    const allowedFields = [
      'name',
      'prize_value',
      'deadline',
      'mail_address_street',
      'mail_address_city',
      'mail_address_state',
      'mail_address_zip',
      'instructions',
      'status',
      'notes',
    ];

    const updateFields = [];
    const params = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
      if (field in updates) {
        updateFields.push(`${field} = $${paramIndex}`);
        params.push(updates[field]);
        paramIndex++;
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // Add status_updated_at if status is being updated
    if ('status' in updates) {
      updateFields.push(`status_updated_at = CURRENT_TIMESTAMP`);
    }

    params.push(id);
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

// DELETE /api/sweepstakes/:id - Remove a sweepstake
router.delete('/api/sweepstakes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const sql = 'DELETE FROM sweepstakes WHERE id = $1 RETURNING *;';
    const result = await query(sql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sweepstake not found' });
    }

    res.json({ message: 'Sweepstake deleted successfully' });
  } catch (err) {
    console.error('Error deleting sweepstake:', err);
    res.status(500).json({ error: 'Failed to delete sweepstake' });
  }
});

// GET /api/dashboard - Return dashboard stats
router.get('/api/dashboard', async (req, res) => {
  try {
    const totalResult = await query('SELECT COUNT(*) as count FROM sweepstakes;');
    const total = totalResult.rows[0].count;

    const statusResult = await query(
      `SELECT status, COUNT(*) as count FROM sweepstakes GROUP BY status;`
    );
    const statusCounts = {};
    statusResult.rows.forEach((row) => {
      statusCounts[row.status] = parseInt(row.count);
    });

    const upcomingResult = await query(
      `SELECT COUNT(*) as count FROM sweepstakes
       WHERE deadline BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days';`
    );
    const upcomingDeadlines = upcomingResult.rows[0].count;

    const prizeResult = await query(
      'SELECT COALESCE(SUM(prize_value), 0) as total_prize FROM sweepstakes;'
    );
    const totalPrizeValue = prizeResult.rows[0].total_prize;

    res.json({
      total,
      statusCounts,
      upcomingDeadlines,
      totalPrizeValue,
    });
  } catch (err) {
    console.error('Error fetching dashboard:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router;
