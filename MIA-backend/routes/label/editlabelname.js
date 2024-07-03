module.exports = function (app, connection) {
     // Handle PUT request to update a label
    app.put('/api/collection/label/:LabelID', async (req, res) => {
        const { newEditedLabel, CollectionID } = req.body;
        const LabelID = req.params.LabelID;
        try {
        
        // Check if the label name is same label name
        const [Labelname] = await connection.execute('SELECT * FROM Label WHERE LabelName = ? AND LabelID = ?', [newEditedLabel, LabelID]);
        if (Labelname.length > 0) {
            return res.status(409).json({ error: 'Same Label name' });
        }
       
        // Check if the label name is already taken
        const [existingLabels] = await connection.execute('SELECT * FROM Label WHERE LabelName = ? AND CollectionID = ?' , [newEditedLabel, CollectionID]);
        if (existingLabels.length > 0) {
            return res.status(409).json({ error: 'Label name is already taken' });
        }

        // Update the label name in the database
        const [result] = await connection.execute('UPDATE Label SET LabelName = ? WHERE LabelID = ?', [newEditedLabel, LabelID]);

        // Send a success response
        res.status(200).json({ message: 'Label updated successfully.' });
        } catch (error) {
        console.error('Error updating label:', error);
        // Send an error response if an unexpected error occurs
        res.status(500).json({ error: 'Internal Server Error' });
        }
    });
}