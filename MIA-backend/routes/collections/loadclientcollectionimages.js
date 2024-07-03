module.exports = function (app, connection) {
    app.get('/api/collection/client/images/:CollectionID/:ClientID', async (req, res) => {
        const CollectionID = req.params.CollectionID;
        const ClientID = req.params.ClientID;
        
        try {  
            // Query to get images with no annotations by the specific client
            const noAnnotationQuery = `
            SELECT DISTINCT Image.ImageID, Image.ImageName, ImageURL
                FROM Collection
                JOIN Image ON Collection.CollectionID = Image.CollectionID
                LEFT JOIN Annotation ON Image.ImageID = Annotation.ImageID AND Annotation.ClientID = ?
                WHERE Collection.CollectionID = ? AND Annotation.AnnotationID IS NULL
                ORDER BY Image.ImageID
            `;
            
            // Query to get images with annotations by the specific client
            const annotationQuery = `
            SELECT DISTINCT Image.ImageID, Image.ImageName, ImageURL
                FROM Collection
                JOIN Image ON Collection.CollectionID = Image.CollectionID
                JOIN Annotation ON Image.ImageID = Annotation.ImageID AND Annotation.ClientID = ?
                WHERE Collection.CollectionID = ?
                ORDER BY Image.ImageID
            `;
            
            // Execute the queries using promises
            const [rows1, fields1] = await connection.execute(noAnnotationQuery, [ClientID, CollectionID]);
            const [rows2, fields2] = await connection.execute(annotationQuery, [ClientID, CollectionID]);

            // Combine the results into a single array with no annotations first followed by with annotations
            const totalRows = [...rows1, ...rows2];

            // Send the query results as a JSON response
            res.json(totalRows);
        } catch (error) {
            console.error('Error:', error);
            // Send an error response if an unexpected error occurs
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
}