module.exports = function(app, connection) {
    app.get('/api/clientcollections/:ClientID', async (req, res) => {
        const { ClientID } = req.params;
        
        try {
            // Execute the query to retrieve permitted collections for the specific client
            const query = `
                SELECT Collection.CollectionID, Collection.CollectionName
                FROM Collection
                INNER JOIN Permission ON Collection.CollectionID = Permission.CollectionID
                WHERE Permission.ClientID = ? AND Permission.IsPermited = 1
                ORDER BY Collection.CollectionID
            `;

            // Execute the query using promises
            const [rows, fields] = await connection.execute(query, [ClientID]);
            
            // Send the query results as a JSON response
            res.json(rows);
        } catch (error) {
            console.error('Error:', error);
            // Send an error response if an unexpected error occurs
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
}