module.exports = function (app, connection) {
    app.get('/api/client/data/:clientID', async (req, res) => {
        const clientID = req.params.clientID;
        
        try {
            // Execute the query to retrieve user data for the specific client
            const [rows, fields] = await connection.execute(
                `SELECT Users.Username
                FROM Users
                INNER JOIN Client ON Users.UserID = Client.UserID
                WHERE Client.ClientID = ?`,
                [clientID]
            );
            
            // Check if user data exists
            if (rows.length > 0) {
                // Send the user data as a JSON response
                const userData = rows[0]; // Assuming only one row is returned
                res.json(userData);
            } else {
                // Send a 404 response if user data is not found
                res.status(404).json({ error: 'User not found' });
            }
        } catch (error) {
            console.error('Error:', error);
            // Send an error response if an unexpected error occurs
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
};