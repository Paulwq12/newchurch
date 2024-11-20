const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3010;

// Middleware
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from public directory
app.use(express.urlencoded({ extended: true }));
app.use('/css', express.static(__path + '/css'));
app.use('/js', express.static(__path + '/js'));

// Data files
const usersPath = path.join(__dirname, 'data', 'users.json');
const attendancePath = path.join(__dirname, 'data', 'attendance.json');

// Helper functions
const loadJSON = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf-8'));
const saveJSON = (filePath, data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

// Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));

app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html')));

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = loadJSON(usersPath);

  const user = users.find((u) => u.username === username);

  if (!user) {
    return res.send("User not found. Please register first.");
  }

  if (!user.approved) {
    return res.send("Login failed. Wait for admin approval.");
  }

  if (user.password !== password) {
    return res.send("Incorrect username or password.");
  }

  const attendance = loadJSON(attendancePath);
  attendance.push({ username, time: new Date().toLocaleString() });
  saveJSON(attendancePath, attendance);

  res.send(`Welcome, ${username}!`);
});

app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'views', 'register.html')));

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const users = loadJSON(usersPath);

  if (users.some((u) => u.username === username)) {
    return res.send("Username already exists. Please log in.");
  }

  users.push({ username, password, approved: false, registrationTime: new Date().toLocaleString() });
  saveJSON(usersPath, users);

  res.send("Registration successful. Wait for admin approval.");
});

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'views', 'admin.html')));

app.get('/admin/view-users', (req, res) => {
  const users = loadJSON(usersPath);
  res.json(users); // You can format the response in HTML or JSON
});

app.get('/admin/daily-logins', (req, res) => {
  const attendance = loadJSON(attendancePath);
  const date = req.query.date || new Date().toISOString().split('T')[0];
  const logins = attendance.filter((log) => log.time.startsWith(date));
  res.json(logins); // You can format the response in HTML or JSON
});

app.get('/admin/approve-users', (req, res) => {
  const users = loadJSON(usersPath).filter((u) => !u.approved);
  res.json(users); // You can format the response in HTML or JSON
});

app.post('/admin/approve', (req, res) => {
  const { username } = req.body;
  const users = loadJSON(usersPath);

  const user = users.find((u) => u.username === username);
  if (user) user.approved = true;

  saveJSON(usersPath, users);
  res.redirect('/admin/approve-users');
});

// Start server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
