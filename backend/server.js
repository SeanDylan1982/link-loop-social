const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Attach io to app for use in routes
app.set('io', io);

// Attach req.io to every request for Socket.IO emits in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/conversations', require('./routes/conversations'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/friendships', require('./routes/friendships'));
// Register new feature routes
app.use('/api/posts', require('./routes/posts'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/topics', require('./routes/topics'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/system-messages', require('./routes/systemMessages'));
app.use('/api/search', require('./routes/search'));
app.use('/api/users', require('./routes/users'));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
  // Start server
  const port = process.env.PORT || 5000;
  http.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Socket.IO logic for real-time messaging
io.on('connection', (socket) => {
  // Join conversation room
  socket.on('join-conversation', (conversationId) => {
    socket.join(conversationId);
  });
  // Optionally handle typing, presence, etc.
}); 