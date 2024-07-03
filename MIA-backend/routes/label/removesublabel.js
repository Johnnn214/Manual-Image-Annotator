module.exports = function (app, connection, fs) {
    // Handle DELETE request to remove a label from a collection
  app.delete('/api/collection/sublabel/:SublabelID', async (req, res) => {
    const { SublabelID } = req.params;
    try {
      await connection.beginTransaction();
      // Retrieve AnnotationID associated with the SublabelID
      const annotationIDsQuery = 'SELECT AnnotationID FROM Annotation WHERE Sub_LabelID = ?';
      const [annotaionRows] = await connection.query(annotationIDsQuery, [SublabelID]);
      // Extract AnnotationID values from the rows
      const annotationIDs = annotaionRows.map(row => row.AnnotationID);
      // Get image paths associated with the sublabel
      const imagePathsQuery = 'SELECT Sub_LabelImageSource FROM Sub_Label WHERE Sub_LabelID = ?';
      const [imageRow] = await connection.query(imagePathsQuery, [SublabelID]);

      const imagePath = imageRow[0].Sub_LabelImageSource;
      // Construct deletion promises for annotations along with the sub-label
      const deletionPromises = [
        annotationIDs.map(annotationID => connection.query('DELETE FROM Annotation WHERE AnnotationID = ?', [annotationID])),
        connection.query('DELETE FROM Sub_Label WHERE Sub_LabelID = ?', [SublabelID])
      ];

      // Execute deletion promises
      await Promise.allSettled(deletionPromises);

      // Delete the corresponding image file from the server's file system
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log('Image file deleted successfully:', imagePath);
      }else {
        console.log("no path")
      }

      // Commit transaction if all deletions are successful
      await connection.commit();

      // Send success response
      res.status(200).json({ message: 'Sublabel and related annotations removed successfully.' });
    } catch (error) {
      console.error('Error removing sublabel and annotations:', error);
      await connection.rollback();
      // Send error response if an unexpected error occurs
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
}
