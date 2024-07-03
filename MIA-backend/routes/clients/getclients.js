module.exports = function (app, connection) {
  app.get('/api/clients', async (req, res) => {
      try {
          // Execute the query to retrieve data from the 'collection' table
          const [rows, fields] = await connection.execute(
              'SELECT Users.Username, Client.ClientID FROM Client JOIN Users ON Client.UserID = Users.UserID;'
          );

          // Send the query results as a JSON response
          res.json(rows);
      } catch (error) {
          console.error('Error:', error);
          // Send an error response if an unexpected error occurs
          res.status(500).json({ error: 'Internal Server Error' });
      }
  });
};