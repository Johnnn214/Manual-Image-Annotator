// Assuming you're using Express.js
module.exports = function (app, connection) {
    app.post('/api/permission', async (req, res) => {
        const { clientID, collectionID } = req.body;

        try {
            // Check if permission entry already exists
            const [checkResults] = await connection.execute(
                `SELECT * FROM Permission WHERE CollectionID = ? AND ClientID = ?`,
                [collectionID, clientID]
            );

            if (checkResults.length > 0) {
                // Permission entry already exists, update IsPermited field
                await connection.execute(
                    `UPDATE Permission SET IsPermited = 1 WHERE CollectionID = ? AND ClientID = ?`,
                    [collectionID, clientID]
                );
                res.status(200).json({ message: 'Permission updated successfully' });
            } else {
                // Permission entry does not exist, insert new entry
                await connection.execute(
                    `INSERT INTO Permission (CollectionID, ClientID, IsPermited) VALUES (?, ?, 1)`,
                    [collectionID, clientID]
                );
                res.status(200).json({ message: 'Permission granted successfully' });
            }
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
};