// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db.js');
const serialRoutes=require('./Routes/serials.js')
const adminRoutes=require('./Routes/admin.js')

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Connect DB
connectDB();

// Routes
app.use('/serials', serialRoutes);
app.use('/admin', adminRoutes);

// basic health
app.get('/', (req, res) => res.send('Server running'));

// start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
