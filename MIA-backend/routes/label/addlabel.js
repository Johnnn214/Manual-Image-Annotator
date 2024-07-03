module.exports = function (app, connection) {
    // Handle POST request to add a new label to a collection
    app.post('/api/collection/label', async (req, res) => {
      const { newLabel, CollectionID } = req.body;
      try {

        const [existingLabels] = await connection.execute('SELECT * FROM Label WHERE LabelName = ? AND CollectionID = ?' , [newLabel, CollectionID]);
        if (existingLabels.length > 0) {
            return res.status(409).json({ error: 'Label name is already taken' });
        }

        // Execute the query to insert the new label into the database
        const [result] = await connection.execute('INSERT INTO Label (LabelName, CollectionID) VALUES (?, ?)', [newLabel, CollectionID]);
  
        // Send a success response
        res.status(200).json({ message: 'Label added successfully.' });
      } catch (error) {
        console.error('Error adding label:', error);
        // Send an error response if an unexpected error occurs
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
}