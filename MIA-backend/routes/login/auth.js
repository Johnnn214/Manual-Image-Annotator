const jwt = require('jsonwebtoken');

module.exports = function (app, connection) {
    app.post('/api/login', async (req, res) => {
        const { username, password } = req.body;

        try {
            // Query the database for the user with the provided username and password
            const query = 'SELECT * FROM Users WHERE Username = ? AND Password = ?';
            const [rows, fields] = await connection.execute(query, [username, password]);

            // Check if user exists
            const user = rows[0];
            if (!user) {
                return res.status(401).json({ error: 'Incorrect username or password' });
            }

            // Determine the user's role and associated ID (if applicable)
            let role;
            let clientId;
            const clientQuery = 'SELECT * FROM Client WHERE UserID = ?';
            const adminQuery = 'SELECT * FROM Admin WHERE UserID = ?';

            // Check if the user is a client
            const [clientRows, clientFields] = await connection.execute(clientQuery, [user.UserID]);
            if (clientRows.length > 0) {
                role = 'client';
                clientId = clientRows[0].ClientID; // Get the client ID
            }

            // Check if the user is an admin
            const [adminRows, adminFields] = await connection.execute(adminQuery, [user.UserID]);
            if (adminRows.length > 0) {
                role = 'admin';
            }

            // Generate JWT token
            const tokenPayload = {
                username: user.Username,
                role,
                clientId // Include client ID if applicable
            };
            const token = jwt.sign(tokenPayload, 'secret', { expiresIn: '1h' });

            // Return the token and user role (and client ID if applicable)
            res.json({ token, role, clientId });
        } catch (error) {
            console.error('Error executing query:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
};