module.exports = function(app, connection) {
    // Handle POST request to add a new sublabel to a label
    app.post('/api/collection/sublabel', async (req, res) => {
       const { newSublabel, LabelID } = req.body;
       
       try {
             // Check if the sublabel name is already taken
        const [existingSublabels] = await connection.execute('SELECT * FROM Sub_Label WHERE Sub_LabelName = ? AND LabelID = ?', [newSublabel, LabelID]);
        if (existingSublabels.length > 0) {
          return res.status(409).json({ error: 'Sublabel name is already taken' });
        }

        // Execute the query to insert the new sublabel into the database
        const query = 'INSERT INTO Sub_Label (Sub_LabelName, LabelID) VALUES (?, ?)';
        const [result] = await connection.execute(query, [newSublabel, LabelID]);
  
        // Send a success response
        res.status(200).json({ message: 'Sublabel added successfully.', SublabelID: result.insertId });
      } catch (error) {
        console.error('Error adding sublabel:', error);
        // Send an error response if an unexpected error occurs
        res.status(500).json({ error: 'An error occurred while adding the sublabel.' });
      }
    });
  };