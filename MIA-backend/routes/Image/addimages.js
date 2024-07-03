// Handle POST request to add a new image to a collection
module.exports = function(app, connection, multer) {
  app.post('/api/collection/upload', async (req, res) => {
    // Set up multer storage
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/collectionimages'); // Specify the directory where files will be saved
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname); // Generate a unique filename
    }
  });

// Set up multer to accept only image files
const upload = multer({ 
  storage: storage,
  fileFilter: function(req, file, cb) {
    // Check if the file is an image
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
}).any(); // Accept any number of files with any field name

    try {
      await new Promise((resolve, reject) => {
        upload(req, res, function(err) {
          if (err instanceof multer.MulterError) {
            // A Multer error occurred
            console.log(err);
            return reject({ status: 500, error: 'An error occurred while uploading files.' });
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
      
      // Files were uploaded successfully
      // Access files using req.files array
      const images = req.files.map(file => [req.body.CollectionID, file.filename, file.path]); // Get filenames of uploaded images

      // Add collection data and images to database
      const insertQuery = 'INSERT INTO Image (CollectionID, ImageName, ImageURL) VALUES ?';
      const result = await connection.query(insertQuery, [images]);

      console.log('Images added to database:', result);
      
      // Send response to client
      res.status(200).json({ message: 'Images added to the collection successfully.' });
    } catch (error) {
      console.error('Error handling file upload:', error);
      res.status(error.status || 500).json({ error: error.error || 'An error occurred.' });
    }
  });
};