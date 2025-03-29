const pool = require('./db');

module.exports = (app) => {
  // DELETE route to remove the user from users table
  app.delete('/leaveQueue', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "userId is required." });
    }

    try {
      // Delete from users table
      const deleteResult = await pool.query(
        'DELETE FROM users WHERE user_id = $1',
        [userId]
      );

      if (deleteResult.rowCount === 0) {
        return res.status(404).json({ success: false, message: "User not found." });
      }

      console.log(`User ${userId} and associated queue entries deleted.`);
      res.status(200).json({ success: true, message: "User and their queue entries deleted successfully." });
    } catch (err) {
      console.error("Error deleting user:", err);
      res.status(500).json({ success: false, message: "Error deleting user." });
    }
  });
};
