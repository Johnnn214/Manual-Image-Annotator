module.exports = function (app, connection) {
    app.get('/api/collection/sublabel/:id', async (req, res) => {
        
        const LabelID = req.params.id;
        
        try {
            const query = `
            SELECT Sub_Label.Sub_LabelID, Sub_Label.Sub_LabelName, Sub_LabelImageSource
                FROM Label
                JOIN Sub_Label ON Label.LabelID = Sub_Label.LabelID
                WHERE Label.LabelID = ?
        `;
        // Execute the query using promises
        const [rows, fields] = await connection.execute(query, [LabelID]);
        // Send the query results as a JSON response
        //console.log(rows);
        res.json(rows);
        } catch (error) {
            console.error('Error:', error);
            // Send an error response if an unexpected error occurs
            res.status(500).json({ error: 'Internal Server Error ' });
        }
    });
} 