const mysql = require('mysql2/promise');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const http = require('http').Server(app);
const fs = require('fs');
const multer = require('multer');
const config = require('./dbConfig');
const PORT = process.env.PORT || 3000;

// // Middleware function to add delay to responses
// const addDelayMiddleware = (req, res, next) => {
//   // Add a delay of 0.5 seconds to all responses
//   setTimeout(next, 500); // Delay of 0.5 seconds
// };

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json()) ;
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));


// // Use the delay middleware for all routes
// app.use(addDelayMiddleware);

async function main() {
  try {
// Create a connection to the MySQL database
  const pool = mysql.createPool(config);

  const connection = await pool.getConnection();

  require('./routes/collections/getcollections.js')(app,connection);
  require('./routes/collections/deletecollection.js')(app,connection,fs);
  require('./routes/collections/addcollection.js')(app,connection);
  require('./routes/collections/editcollectionname.js')(app,connection);

  require('./routes/collections/getclientcollections.js')(app,connection);

  require('./routes/Image/addimages.js')(app,connection, multer, fs);
  require('./routes/Image/deleteimage.js')(app,connection,fs);
  require('./routes/Image/deleteallimages.js')(app,connection,fs);

  require('./routes/label/getlabel.js')(app,connection);
  require('./routes/label/addlabel.js')(app,connection);
  require('./routes/label/editlabelname.js')(app,connection);
  require('./routes/label/removelabel.js')(app,connection,fs);
  require('./routes/label/uploadlabelimage.js')(app,connection,multer,fs);

  require('./routes/label/getsublabel.js')(app,connection);
  require('./routes/label/addsublabel.js')(app,connection);
  require('./routes/label/editsublabelname.js')(app,connection);
  require('./routes/label/removesublabel.js')(app,connection,fs);
  require('./routes/label/uploadsublabelimage.js')(app,connection,multer,fs);

  require('./routes/collections/loadcollectionname.js')(app,connection);
  require('./routes/collections/loadclientcollectionimages.js')(app,connection);
  require('./routes/collections/loadadmincollectionimages.js')(app,connection);

  require('./routes/annotation/getannotation.js')(app,connection);
  require('./routes/annotation/addannotation.js')(app,connection);
  require('./routes/annotation/updateannotation.js')(app,connection);
  require('./routes/annotation/deleteannotation.js')(app,connection);

  require('./routes/clients/getclients.js')(app,connection);
  require('./routes/clients/getclient.js')(app,connection);
  require('./routes/clients/getuserdata.js')(app,connection);
  require('./routes/clients/permit.js')(app,connection);

  require('./routes/login/auth.js')(app,connection);

  require('./routes/listen.js')(http,PORT);

    } catch (error) {
      console.error('Error:', error);
    }
}

main().catch(console.error);