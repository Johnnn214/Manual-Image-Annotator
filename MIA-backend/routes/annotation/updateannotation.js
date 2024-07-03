module.exports = function (app, connection) {
    //    // Middleware function to add delay to responses
    //    const addDelayMiddleware = (req, res, next) => {
    //     // Add a delay of 0.5 seconds to the response
    //     setTimeout(next, 2000); // Delay of 0.5 seconds
    // };
    // app.put('/api/collection/annotation/update', addDelayMiddleware, async (req, res) => {

    // Handle PUT request to update an existing annotation
    app.put('/api/collection/annotation/update', async (req, res) => {
        const annotationId = req.body.Annotation.AnnotationID;
        const { Annotation } = req.body;
        try {
            // console.log("annotaion id", req.body.Annotation.AnnotationID);
            // console.log("annotaion", req.body);
            // Extract data from the annotation object
            const { LabelID, Sub_LabelID, startX, startY, width, height } = Annotation;
            
            // Execute the query to update the annotation in the database
            const [result] = await connection.execute(`UPDATE Annotation SET LabelID = ?, 
            Sub_LabelID = ?, startX = ?, startY = ?, width = ?, height = ? WHERE AnnotationID = ?`,
             [ LabelID, Sub_LabelID, startX, startY, width, height, annotationId]);
            
            // Send a success response
            res.status(200).json({ message: 'Annotation updated successfully.' });
        } catch (error) {
            console.error('Error updating annotation:', error);
            // Send an error response if an unexpected error occurs
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
}