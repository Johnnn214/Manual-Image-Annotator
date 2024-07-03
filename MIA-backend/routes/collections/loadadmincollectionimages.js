module.exports = function (app, connection) {
    app.get('/api/collection/admin/images/:CollectionID', async (req, res) => {
        
        const CollectionID = req.params.CollectionID;
        
        try {  

        const query = `
        SELECT Image.ImageID, Image.ImageName, ImageURL
            FROM Collection
            JOIN Image ON Collection.CollectionID = Image.CollectionID
            WHERE Collection.CollectionID = ?
            ORDER BY Image.ImageID
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