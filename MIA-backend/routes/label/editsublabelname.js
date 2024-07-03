module.exports = function (app, connection) {
      // Handle PUT request to update a sublabel
    app.put('/api/collection/sublabel/:SubLabelID', async (req, res) => {
        const { newEditedSublabel, LabelID } = req.body;
        const SubLabelID = req.params.SubLabelID;

        try {
 
        // Check if the sublabel name is the same
        const [Sublabelname] = await connection.execute('SELECT * FROM Sub_Label WHERE Sub_LabelName = ? AND Sub_LabelID = ?', [newEditedSublabel, SubLabelID]);
        if (Sublabelname.length > 0) {
            return res.status(409).json({ error: 'Same sublabel name' });
        }

        // Check if the label name is already taken
        const [existingSubLabels] = await connection.execute('SELECT *  FROM Sub_Label WHERE Sub_LabelName = ?  AND LabelID = ?' , [newEditedSublabel, LabelID]);
        if (existingSubLabels.length > 0) {
            return res.status(409).json({ error: 'SubLabel name is already taken' });
        }
         
        // Update the sublabel name in the database
        const [result] = await connection.execute('UPDATE Sub_Label SET Sub_LabelName = ? WHERE Sub_LabelID = ?', [newEditedSublabel, SubLabelID]);

        // Send a success response
        res.status(200).json({ message: 'Sublabel updated successfully.' });
        } catch (error) {
        console.error('Error updating sublabel:', error);
        // Send an error response if an unexpected error occurs
        res.status(500).json({ error: 'Internal Server Error' });
        }
    });
}