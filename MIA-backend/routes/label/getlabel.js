module.exports = function (app, connection) {
    app.get('/api/collection/label/:id', async (req, res) => {
        
        const CollectionID = req.params.id;
        
        try {
            const query = `
            SELECT Label.LabelID, Label.LabelName, Label.LabelImageSource
                FROM Collection
                JOIN Label ON Collection.CollectionID = Label.CollectionID
                WHERE Collection.CollectionID = ?
        `;
        // Execute the query using promises
        const [rows, fields] = await connection.execute(query, [CollectionID]);
        // Send the query results as a JSON response
        //console.log(rows);
        res.json(rows);
        } catch (error) {
            console.error('Error:', error);
            // Send an error response if an unexpected error occurs
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
}