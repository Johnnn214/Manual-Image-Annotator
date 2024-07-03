module.exports = function (app, connection) {
    app.get('/api/client/:clientID', async (req, res) => {
        const clientID = req.params.clientID;
        console.log(clientID);
        try {
            // Execute the query to retrieve collections and permission status for the specific client
            const query = `
                SELECT Collection.CollectionID, Collection.CollectionName, 
                       CASE WHEN Permission.IsPermited = 1 THEN 'Permitted' ELSE 'Not Permitted' END AS PermissionStatus
                FROM Collection
                LEFT JOIN Permission ON Collection.CollectionID = Permission.CollectionID
                WHERE Permission.ClientID = ?
            `;

            // Execute the query using promises
            const [rows, fields] = await connection.execute(query, [clientID]);
            console.log(rows);
            // Send the query results as a JSON response
            res.json(rows);
            
            
        } catch (error) {
            console.error('Error:', error);
            // Send an error response if an unexpected error occurs
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
};