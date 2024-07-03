// Delete a collection by ID
module.exports = function (app, connection,fs) {
  app.delete('/api/collection/:collectionID', async (req, res) => {
    const { collectionID } = req.params;

    console.log(collectionID);
    try {
      await connection.beginTransaction();

      // Retrieve Sub_LabelID associated with the collectionID
      const subLabelIDsQuery = 'SELECT Sub_LabelID FROM Sub_Label WHERE LabelID IN (SELECT LabelID FROM Label WHERE CollectionID = ?)';
      // Retrieve AnnotationID associated with the collectionID
      const annotationIDsQuery = 'SELECT AnnotationID FROM Annotation WHERE CollectionID = ?';

      const [subLabelRows] = await connection.query(subLabelIDsQuery, [collectionID]);
      const [annotationRows] = await connection.query(annotationIDsQuery, [collectionID]);
      // Extract Sub_LabelID values from the rows
      const subLabelIDs = subLabelRows.map(row => row.Sub_LabelID);
      const annotationIDs = annotationRows.map(row => row.AnnotationID);
      // Construct deletion promises for sub-labels along with other related records

      // Get image paths associated with the collection label and sublabel
      const imagePathsQuery1 = 'SELECT ImageURL FROM Image WHERE CollectionID = ?';
      const imagePathsQuery2 = 'SELECT LabelImageSource FROM Label WHERE CollectionID = ?';
      const imagePathsQuery3 = 'SELECT Sub_LabelImageSource FROM Sub_Label WHERE LabelID IN (SELECT LabelID FROM Label WHERE CollectionID = ?)';
      const [imageRows1] = await connection.query(imagePathsQuery1, [collectionID]);
      const [imageRows2] = await connection.query(imagePathsQuery2, [collectionID]);
      const [imageRows3] = await connection.query(imagePathsQuery3, [collectionID]);

      const imagePaths = [...imageRows1.map(row => row.ImageURL), ...imageRows2.map(row => row.LabelImageSource), ...imageRows3.map(row => row.Sub_LabelImageSource)];

      console.log(imagePaths);
      //const imagePaths = imageRows1.map(row => row.ImageURL);

      const deletionPromises = [
        annotationIDs.map(annotationID => connection.query('DELETE FROM Annotation WHERE AnnotationID = ?', [annotationID])),
        connection.query('DELETE FROM Sub_Label WHERE Sub_LabelID IN (?)', [subLabelIDs]),
        connection.query('DELETE FROM Label WHERE CollectionID = ?', [collectionID]),
        connection.query('DELETE FROM Image WHERE CollectionID = ?', [collectionID]),
        connection.query('DELETE FROM Permission WHERE CollectionID = ?', [collectionID]),
        connection.query('DELETE FROM Collection WHERE CollectionID = ?', [collectionID])
      ];

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

      // Execute deletion promises
      await Promise.allSettled(deletionPromises);

      // Commit transaction if all deletions are successful
      await connection.commit();

      // Send success response
      res.json({ message: 'Collection and related records deleted successfully' });
    } catch (error) {
      console.error('Error:', error);
      // Rollback transaction if an error occurs
      await connection.rollback();
      // Send error response
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
};