module.exports = function(app, connection,fs) {
  app.delete('/api/collection/:CollectionId/image/:ImageId', async (req, res) => {
    const { CollectionId, ImageId } = req.params;
    try {
      await connection.beginTransaction();

      // Execute the query to delete the image from the collection
      const annotationIDsQuery = 'SELECT AnnotationID FROM Annotation WHERE ImageID = ?';
      const [annotationRows] = await connection.query(annotationIDsQuery, [ImageId]);
      const annotationIDs = annotationRows.map(row => row.AnnotationID);

      const deleteQuery = 'DELETE FROM Image WHERE CollectionID = ? AND ImageID = ?';
      const selectQuery = 'SELECT ImageURL FROM Image WHERE CollectionID = ? AND ImageID = ?';
      const [imageRow] = await connection.query(selectQuery, [CollectionId, ImageId]);
      const imageURL = imageRow[0].ImageURL;
      const deletionPromises = [
        // Delete corresponding annotations
        ...annotationIDs.map(annotationID => connection.query('DELETE FROM Annotation WHERE AnnotationID = ?', [annotationID])),
        // Delete image from the database
        connection.query(deleteQuery, [CollectionId, ImageId])
      ];

      // Execute deletion promises
      await Promise.allSettled(deletionPromises);

      // Delete the corresponding image file from the server's file system
      if (fs.existsSync(imageURL)) {
        fs.unlinkSync(imageURL);
        console.log('Image file deleted successfully:', imageURL);
      }

      // Commit transaction if all deletions are successful
      await connection.commit();

      // Send a success response
      res.status(200).json({ message: 'Image deleted successfully' });
    } catch (error) {
      console.error('Error:', error);
      // Rollback transaction if an error occurs
      await connection.rollback();
      // Send an error response if an unexpected error occurs
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
};