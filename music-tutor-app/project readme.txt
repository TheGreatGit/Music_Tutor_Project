# MUSIC TUTOR APP readme

The project github repo is at
https://github.com/TheGreatGit/Music_Tutor_Project

## PREREQUISITES:
Before running the project locally, make sure to have installed
-Node js
- npm
- PostgreSQL installed and running
- install the local Postgres database for the app (a databse backup file is in the github repo as final_year_project_db_FINAL_BACKUP.backup)

## .ENV FILE SETUP
Create .env in the backend folder with the following variables for PostgreSQL and express:
-------------
PGHOST=localhost
PGPORT=5432
PGDATABASE=final_year_project_DB
PGUSER=postgres OR YOUR OWN PGUSER username
PGPASSWORD=your_password_here
PGSSLMODE=disable

PORT=3000

JWT_SECRET=your_jwt_secret_here
-----------------------
-- can run this command in node to generate JWT secret: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"--

IT IS RECOMMENDED TO RUN SEPARATE TERMINALS FOR FRONTEND AND BACKEND 

## BACKEND SETUP
Ensure the .env file has been created as above and that postgreSQL is running and has the final_year_project_DB database installed.
from MUSIC-TUTOR-APP folder  run cd backend, then npm install, then npm run dev for development mode OR npm run start for normal mode
Express will run from localhost port 3000.
You can check the bakcend is running at http://localhost:3000/api/health

## FRONTEND SETUP
From MUSIC-TUTOR-APP folder run cd frontend, then npm install.
npm run dev for development mode  - runs on localhost:5173
npm run prod for local production build - runs on localhost:4173. This command runs vite build -to build a local dist folder- then runs vite preview which runs the dist folder.
Once a dist folder has been created, and no code changes have been made, you can just run npm run preview.
Ensure that you have localhost in the frontend URL and not 127.0.0.1.

## CORS SETTINGS:
Vite will run the frontend at port 5173 in deveopment mode or port 4173 in local production mode.
The approved origins for CORS are therefore http://localhost:5173 and http://localhost:4173
These are used in the express server CORS settings and in the socket.io server CORS settings.
The app does NOT run in https

## USER LOGIN DETAILS:
All users' usernames are in the format of firstnamelastname@email.com and the password is 12345678.

Test Tutor login:
username testtutor@email.com
passsword: 12345678

Test student login:
username: teststudent@email.com
password: 12345678

## TROUBLESHOOTING
vite preview says dist does not exist:
the dist folder hasn't been built yet so run  npm run prod,  or run npm run build followed by npm run preview. Could also just do npm run dev

Frontend can't connect to backend
Check the backend is running at http://localhost:3000/api/health
As mentioned above, ensure that the front end is using localhost in the URL and not 127.0.0.1
Check that the frontend requests are directed to the correct server  http://localhost:3000