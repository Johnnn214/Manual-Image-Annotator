module.exports = function (app, connection) {
    // getting annotation
    app.get('/api/collection/annotation/:ClientID/:ImageID', async (req, res) => {
        
        const {ClientID, ImageID} = req.params;
        
        try {
            const query = `
            SELECT Annotation.ClientID,
            Annotation.ImageID,
            Annotation.AnnotationID,
            Annotation.CollectionID,
            Annotation.LabelID,
            Annotation.Sub_LabelID,
            Annotation.startX,
            Annotation.startY,
            Annotation.width,
            Annotation.height
            FROM Client
            JOIN Annotation ON Client.ClientID = Annotation.ClientID
            JOIN Image ON Image.ImageID = Annotation.ImageID
            WHERE Client.ClientID = ? AND Image.ImageID = ?;
        `;
        // Execute the query using promises
        const [rows, fields] = await connection.execute(query, [ClientID, ImageID]);
        // Send the query results as a JSON response
        //console.log(rows);
        res.json(rows);
        console.log(rows);
        } catch (error) {
            console.error('Error:', error);
            // Send an error response if an unexpected error occurs
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
}