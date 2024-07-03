module.exports = async function (app, connection) {
    app.put('/api/collection/:CollectionID', async (req, res) => {
        try {
            // Retrieve the collection ID from the request parameters
            const CollectionID = req.params.CollectionID;

            // Retrieve the collection name from the request body
            const { CollectionName } = req.body;

            // Start a transaction
            await connection.beginTransaction();
            //same collection name
            const [existingCollection] = await connection.execute('SELECT * FROM Collection WHERE CollectionName = ? AND CollectionID = ?', [CollectionName, CollectionID]);
            
            if (existingCollection.length > 0) {
                // If the collection name is already taken, rollback and send a conflict response
                await connection.rollback();
                return res.status(409).json({ error: 'The same collection name' });
            }

            // Check if the collection name is already taken
            const [existingCollections] = await connection.execute('SELECT * FROM Collection WHERE CollectionName = ?', [CollectionName]);
            
            if (existingCollections.length > 0) {
                // If the collection name is already taken, rollback and send a conflict response
                await connection.rollback();
                return res.status(409).json({ error: 'Collection name is already taken' });
            }

            // Update the collection name in the database
            const updateCollection = 'UPDATE Collection SET CollectionName = ? WHERE CollectionID = ?';
            await connection.execute(updateCollection, [CollectionName, CollectionID]);

            // Commit the transaction
            await connection.commit();

            // Send a success response to the client
            res.status(200).json({ message: 'Collection name updated successfully' });
        } catch (error) {
            console.error('Error updating collection:', error);
            // Rollback the transaction if an error occurs
            await connection.rollback();
            // Send an error response if an unexpected error occurs
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
}
