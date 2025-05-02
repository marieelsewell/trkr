const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const userRoutes = require('./routes/user');
const applicationRoutes = require('./routes/application');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

// MIDDLEWARE
// ------------------------------------------------------------------------------------------------------------------------
app.use(express.static(path.join(__dirname, 'public', 'dist')));
app.use(cors({
  origin: ['http://localhost:5173', 'https://trkr-vu70.onrender.com'], 
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: 'adnkfhhgkhskglsjgfljash', 
  saveUninitialized: true,
  resave: false,
}));
app.use("/api/applications", authMiddleware, applicationRoutes);
app.use("/api/users", userRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'dist', 'index.html'));
});

// CONNECT TO DATABASE
// ------------------------------------------------------------------------------------------------------------------------
const uri = "mongodb+srv://se4200:JR42skBddRMJQLxC@cluster0.qgxxv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Successfully connected to MongoDB with Mongoose!");
}).catch((error) => {
  console.error("Error connecting to MongoDB with Mongoose:", error);
});

// START SERVER
// ------------------------------------------------------------------------------------------------------------------------
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});