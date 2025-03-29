const pool = require('./db');

async function checkUser(email) {
  try {
    // Query to check if user exists and retrieve their queue_id (if they are in a queue)
    const userResult = await pool.query(
      `SELECT users.user_id, users.firstname, users.lastname, users.email, queue_entries.queue_id
       FROM users
       LEFT JOIN queue_entries ON users.user_id = queue_entries.user_id
       WHERE users.email = $1;`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return { success: false, message: "User not found." };
    }

    const user = userResult.rows[0];
    const responseMessage = user.queue_id
      ? `User is currently in queue ${user.queue_id}.`
      : "User exists but is not in any queue.";

    return {
      success: true,
      message: responseMessage,
      user,
    };
  } catch (error) {
    console.error("Error checking user:", error);
    return { success: false, message: "Internal server error." };
  }
}

module.exports = checkUser;
