# Manual Image Annotator

## Dependencies

To download dependencies run `npm install` for both MIA-backend and frontend

## Backend

### Database Config
You have to install MySQL. Information on installing MySQL, go to 
`https://dev.mysql.com/doc/mysql-getting-started/en/`
or search `MySQL` in google.


Once You have a MySQL set up.


Create the database using the .sql files which is located in the DatabaseScript directory.
You can find videos on how to do this online by seaching `MySQL`.


Once the databse is set up. Find the `dbConfig.js` file to configure the database.

### Development server
Run `node server.js` to start the server which will be hosted at `Port 3000`.


Run `nodemon server.js`. This will automatically restart the server when any saved changes are made on the source file.

## Frontend
### Backend url
Find the `baseurl.ts` file which is in the `src` directory to change the backend url.

By default it is on `http://localhost:3000/` which will work when the backend is ran on local machine. 

### Development server

Run `ng serve` for a dev server. Navigate to 
`http://localhost:4200/`. The application will
automatically reload if you change any of the source files.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.


For deployment, the publish directory will be in `./dist/m.i.a/browser`.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

