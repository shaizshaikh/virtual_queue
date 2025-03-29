const express = require('express');
const cors = require('cors');
const pool = require('./db');
const joinQueue = require('./joinQueue'); 
const leaveQueue = require('./leaveQueue');
const checkUser = require('./checkUser'); // ✅ Import checkUser

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// 🟢 Test Route
app.get('/', (req, res) => {
    res.send('Hello from Express!');
});

// 🟢 Fetch All Queues
app.get('/queues', async (req, res) => {
    try {
        console.log("Fetching queues...");
        const result = await pool.query('SELECT * FROM queues;');

        if (result.rows.length === 0) {
            console.log("No queues found.");
            return res.status(404).json({ success: false, message: "No queues found." });
        }

        console.log("Queues fetched successfully:", result.rows);
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching queues:", err);
        res.status(500).json({ success: false, message: "Error fetching queues." });
    }
});

// 🟢 Join Queue API
app.post('/joinQueue', async (req, res) => {
    const { userId, firstname, lastname, email, queueId } = req.body;

    if (!userId || !firstname || !lastname || !email || !queueId) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const result = await joinQueue(userId, firstname, lastname, email, queueId);
    res.status(result.success ? 200 : 500).json(result);
});

// 🟢 Apply Leave Queue API
leaveQueue(app);

// 🟢 Check User API ✅ NEW
app.get('/checkUser', async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    try {
        const result = await checkUser(email);
        res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
        console.error("Error in checkUser endpoint:", error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

// 🟢 Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
