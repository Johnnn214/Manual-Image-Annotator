module.exports = function (app, connection) {
    app.get('/api/collection/name/:id', async (req, res) => {
        
        const CollectionID = req.params.id;
        
        try {
            const query = `
            SELECT Collection.CollectionName
                FROM Collection
                WHERE Collection.CollectionID = ?
        `;
        // Execute the query using promises
        const [rows, fields] = await connection.execute(query, [CollectionID]);
        
        // Send the query results as a JSON response
        console.log(rows);
        const userData = rows[0];
        res.json(userData);
            
        } catch (error) {
            console.error('Error:', error);
            // Send an error response if an unexpected error occurs
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
}