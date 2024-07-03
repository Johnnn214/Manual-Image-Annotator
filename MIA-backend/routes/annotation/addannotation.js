module.exports = function (app, connection) {
    // // Middleware function to add delay to responses
    // const addDelayMiddleware = (req, res, next) => {
    //     // Add a delay of 0.5 seconds to the response
    //     setTimeout(next, 2000); // Delay of 0.5 seconds
    // };
    //app.post('/api/collection/annotation', addDelayMiddleware, async (req, res) => {

    // Handle POST request to add a new annotation to a collection
    app.post('/api/collection/annotation', async (req, res) => {
        const { Annotation } = req.body;
        try {
            // Extract data from the annotation object
            const { CollectionID, ClientID, ImageID, LabelID, Sub_LabelID, startX, startY, width, height } = Annotation;
            
            // Execute the query to insert the new annotation into the database
            const [result] = await connection.execute(`INSERT INTO Annotation ( CollectionID, ClientID, ImageID, LabelID, 
                Sub_LabelID, startX, startY, width, height) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                [CollectionID, ClientID, ImageID, LabelID, Sub_LabelID, startX, startY, width, height]);
            
            // Send a success response
            res.status(200).json({ message: 'Annotation added successfully.' });
        } catch (error) {
            console.error('Error adding annotation:', error);
            // Send an error response if an unexpected error occurs
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
}