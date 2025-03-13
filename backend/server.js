const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport'); // ✅ Import passport directly
require('./middlewares/passport')(passport); // ✅ Initialize Passport
const authRoutes = require('./routes/auth');
const cookieParser = require('cookie-parser');

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize()); // ✅ Initialize passport

// Routes
app.use('/api/auth', authRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Server Listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
