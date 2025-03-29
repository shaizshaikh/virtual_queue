const pool = require('./db');

async function joinQueue(userId, firstname, lastname, email, queueId) {
  try {
    // Check if a user with this email already exists
    let userResult = await pool.query('SELECT * FROM users WHERE email = $1;', [email]);
    let finalUserId;

    if (userResult.rows.length === 0) {
      // No existing user: Insert new user
      await pool.query(
        'INSERT INTO users (user_id, firstname, lastname, email, created_at) VALUES ($1, $2, $3, $4, NOW());',
        [userId, firstname, lastname, email]
      );
      finalUserId = userId;
    } else {
      // User exists: Use the existing user_id
      finalUserId = userResult.rows[0].user_id;
    }

    // Insert the user into the queue_entries table
    await pool.query(
      'INSERT INTO queue_entries (queue_id, user_id, position, joined_at) VALUES ($1, $2, (SELECT COALESCE(MAX(position), 0) + 1 FROM queue_entries WHERE queue_id = $1), NOW());',
      [queueId, finalUserId]
    );

    return { success: true, message: "User successfully joined the queue." };
  } catch (error) {
    console.error("Error joining queue:", error);
    return { success: false, message: "Error joining queue." };
  }
}

module.exports = joinQueue;
