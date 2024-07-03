module.exports = function (app, connection, fs) {
  // Handle DELETE request to delete all images in a collection
  app.delete('/api/collection/:collectionId/images', async (req, res) => {
    const collectionId = req.params.collectionId;

    try {
      await connection.beginTransaction();

 

      // Retrieve all images related to the collection
      const selectImagesQuery = 'SELECT ImageID, ImageURL FROM Image WHERE CollectionID = ?';
      const [images] = await connection.execute(selectImagesQuery, [collectionId]);

      if (images.length === 0) {
        return res.status(404).json({ message: 'No images found in the collection.' });
      }

      const imagePaths = images.map(row => row.ImageURL);
      const imageIDs = images.map(row => row.ImageID);

       // Retrieve all annotations related to the images
      const annotationIDsQuery = 'SELECT AnnotationID FROM Annotation WHERE CollectionID = ?';
      const [annotationRows] = await connection.query(annotationIDsQuery, [collectionId]);

      const annotationIDs = annotationRows.map(row => row.AnnotationID);
     

      const deletionPromises = [
        annotationIDs.map(annotationID => connection.query('DELETE FROM Annotation WHERE AnnotationID = ?', [annotationID])),
        connection.query('DELETE FROM Image WHERE CollectionID = ?', [collectionId])
      ];
 
      // Delete image files from the server
      deletionPromises.push(
        imagePaths.map(imagePath => new Promise((resolve, reject) => {
          if (fs.existsSync(imagePath)) {
            fs.unlink(imagePath, err => {
              if (err) {
                console.error('Error deleting image file:', err);
                reject(err);
              } else {
                console.log('Image file deleted successfully:', imagePath);
                resolve();
              }
            });
          } else {
            console.log("Path does not exist:", imagePath);
            resolve();
          }
        }))
      );

      // Execute deletion promises
      await Promise.allSettled(deletionPromises);

      // Commit transaction if all deletions are successful
      await connection.commit();

      res.status(200).json({ message: 'All images and associated annotations deleted successfully.' });
    } catch (error) {
      console.error('Error deleting images and annotations:', error);
      // Rollback transaction if an error occurs
      await connection.rollback();
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
}