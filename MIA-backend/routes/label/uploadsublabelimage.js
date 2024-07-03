// Handle POST request to add a new image to a collection
module.exports = function(app, connection, multer, fs) {
  app.post('/api/collection/sublabel/upload', async (req, res) => {
    // Set up multer storage
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, 'uploads/sublabelimages'); // Specify the directory where files will be saved
      },
      filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Generate a unique filename
      }
    });

    // Set up multer to accept only one image file
    const upload = multer({ 
      storage: storage,
      fileFilter: function(req, file, cb) {
        // Check if the file is an image
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      }
    }).single('sublabelimage'); // Accept only one file with the field name 'labelimage'

    console.log("testing");
    try {
      await new Promise((resolve, reject) => {
        upload(req, res, function(err) {
          if (err instanceof multer.MulterError) {
            // A Multer error occurred
            console.log(err);
            return reject({ status: 500, error: 'An error occurred while uploading file.' });
          } else if (err instanceof Error) {
            // A file type error occurred
            console.log(err.message); // Log the error message
            return reject({ status: 400, error: err.message }); // Pass error message to client
          } else if (err) {
            // An unknown error occurred
            console.log(err);
            return reject({ status: 500, error: 'An unknown error occurred.' });
          }
          resolve();
        });
      });

      // Access file using req.file object
      const SublabelID = req.body.sublabelID; // Get LabelID from request body
      const sublabelImageSource = req.file.path; // Get file path of uploaded image
      const selectQuery ='SELECT Sub_LabelImageSource FROM Sub_Label WHERE Sub_LabelID = ?';
      const [imageRow] = await connection.query(selectQuery, SublabelID );
      const imageURL = imageRow[0].Sub_LabelImageSource;
      
      // Delete the corresponding image file from the server's file system
      if (fs.existsSync(imageURL)) {
        fs.unlinkSync(imageURL);
        console.log('previous LabelImageSource file deleted successfully:', imageURL);
      }
      // File was uploaded successfully
     
      
      // Execute the query to update the Label in the database
      const result = await connection.execute(`UPDATE Sub_Label SET Sub_LabelImageSource = ? WHERE Sub_LabelID = ?`, [sublabelImageSource, SublabelID]);

      console.log('SubLabel Image added to database:', result);
      
      // Send response to client
      res.status(200).json({ message: 'Label Image added successfully.' });
    } catch (error) {
      console.error('Error handling file upload:', error);
      res.status(error.status || 500).json({ error: error.error || 'An error occurred.' });
    }
  });
};