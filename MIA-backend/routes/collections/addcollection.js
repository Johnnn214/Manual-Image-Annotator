module.exports = async function (app, connection) {
    app.post('/api/collection', async (req, res) => {
        try {
            // Retrieve the collection name from the request body
            const  collectionName  = req.body.CollectionName;
            // Start a transaction
            await connection.beginTransaction();
            //Execute the query to insert the new collection into the database

             // Check if the collection name is already taken
             const [existingCollections] = await connection.execute('SELECT * FROM Collection WHERE CollectionName = ?', [collectionName]);
            
             if (existingCollections.length > 0) {
                 // If the collection name is already taken, rollback and send a conflict response
                 await connection.rollback();
                 return res.status(409).json({ error: 'Collection name is already taken' });
             }

            const insertCollection = 'INSERT INTO Collection (CollectionName) VALUES (?)';
            const [insertCollectionResult] = await connection.execute(insertCollection, [collectionName]);
            const collectionID = insertCollectionResult.insertId;
            // Create permission entries for each client
            const createPermissionQuery = `
                INSERT INTO Permission (CollectionID, ClientID, IsPermited)
                SELECT ?, ClientID, 0
                FROM Client
            `;
            await connection.execute(createPermissionQuery, [collectionID]);
            //Commit the transaction
            await connection.commit();
            // Send a success response to the client
            res.status(201).json({ message: 'Collection created successfully' });
        } catch (error) {
            console.error('Error creating collection:', error);
            // Rollback the transaction if an error occurs
            await connection.rollback();
            // Send an error response if an unexpected error occurs
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
}
