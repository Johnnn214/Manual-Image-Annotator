module.exports = function (app, connection, fs) {
    // Handle DELETE request to remove a label from a collection
  app.delete('/api/collection/label/:labelID', async (req, res) => {
    const { labelID } = req.params;
    try {
      await connection.beginTransaction();
      // Execute the query to delete the image from the collection
      const annotationIDsQuery = 'SELECT AnnotationID FROM Annotation WHERE LabelID = ?';
      const [annotaionRows] = await connection.query(annotationIDsQuery, [labelID]);
      const annotationIDs = annotaionRows.map(row => row.AnnotationID);

      const sublabelIDsQuery = 'SELECT Sub_LabelID FROM Sub_Label WHERE LabelID = ?';
      const [sublabelRows] = await connection.query(sublabelIDsQuery, [labelID]);
      const sublabelIDs = sublabelRows.map(row => row.Sub_LabelID);

      // Get image paths associated with the label
      const imagePathsQuery1 = 'SELECT LabelImageSource FROM Label WHERE LabelID = ?';
      const imagePathsQuery2 = 'SELECT Sub_LabelImageSource FROM Sub_Label WHERE LabelID = ?';
      const [imageRow1] = await connection.query(imagePathsQuery1, [labelID]);
      const [imageRows2] = await connection.query(imagePathsQuery2, [labelID]);

      // Get image paths associated with the collection label and sublabel
      const imagePaths = [...imageRow1.map(row => row.LabelImageSource), ...imageRows2.map(row => row.Sub_LabelImageSource)];
      
      //console.log(imagePaths);

      const deletionPromises = [
        annotationIDs.map(annotationID => connection.query('DELETE FROM Annotation WHERE AnnotationID = ?', [annotationID])),
        sublabelIDs.map(sublabelID => connection.query('DELETE FROM Sub_Label WHERE Sub_LabelID = ?', [sublabelID])),
        // Execute the query to delete the label from the database
        connection.execute('DELETE FROM Label WHERE LabelID = ?', [labelID])
      ];
            // Execute deletion promises
      await Promise.allSettled(deletionPromises);

      // Add deletion of image files to the promises
      deletionPromises.push(
        imagePaths.forEach(imagePath => new Promise((resolve, reject) => {
          if (fs.existsSync(imagePath)){
            fs.unlink(imagePath, err => {
              if (err) {
                console.error('Error deleting image file:', err);
                reject(err);
              } else {
                console.log('Image file deleted successfully:', imagePath);
                resolve();
              }
            });
          }else{
            console.log("path does not exist", imagePath);
            resolve();
          }
        }))
      );
    
      // Commit transaction if all deletions are successful
      await connection.commit();

      // Send a success response
      res.status(200).json({ message: 'Label and related sublabels removed successfully.' });
    } catch (error) {
      console.error('Error removing label and sublabels:', error);
      await connection.rollback();
      // Send an error response if an unexpected error occurs
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
}
