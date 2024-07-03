module.exports = function (app, connection) {
    //     // Middleware function to add delay to responses
    //     const addDelayMiddleware = (req, res, next) => {
    //         // Add a delay of 0.5 seconds to the response
    //         setTimeout(next, 2000); // Delay of 0.5 seconds
    //     };
    // app.delete('/api/collection/annotation/delete/:AnnotationID',addDelayMiddleware, async (req, res) => {
    // Handle DELETE request to delete an annotation from a collection
    app.delete('/api/collection/annotation/delete/:AnnotationID', async (req, res) => {
        const { AnnotationID } = req.params;
        try {
            // Execute the query to delete the annotation from the database
            const [result] = await connection.execute('DELETE FROM Annotation WHERE AnnotationID = ?', [AnnotationID]);
            
            if (result.affectedRows === 0) {
                // If no rows were affected, the annotation with the provided ID was not found
                return res.status(404).json({ error: 'Annotation not found.' });
            }

            // Send a success response
            res.status(200).json({ message: 'Annotation deleted successfully.' });
        } catch (error) {
            console.error('Error deleting annotation:', error);
            // Send an error response if an unexpected error occurs
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

}