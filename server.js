const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3010;

// Middleware
app.use('/css', express.static(path.join(__dirname, 'css'))); // Serve CSS folder
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Data files
const usersPath = path.join(__dirname, 'data', 'users.json');
const attendancePath = path.join(__dirname, 'data', 'attendance.json');

// Helper functions
const loadJSON = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf-8'));
const saveJSON = (filePath, data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

// Routes
app.get('/', (req, res) => res.render('index'));

app.get('/login', (req, res) => res.render('login'));

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
  // Standardize date format for logging
  attendance.push({
    username,
    time: new Date().toISOString() // Saves as "YYYY-MM-DDTHH:MM:SSZ"
  });
  saveJSON(attendancePath, attendance);

  res.send(`Welcome, ${username}!`);
});

app.get('/register', (req, res) => res.render('register'));

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

app.get('/admin', (req, res) => res.render('admin'));

app.get('/admin/view-users', (req, res) => {
  const users = loadJSON(usersPath);
  res.render('view_users', { users });
});

app.get('/admin/daily-logins', (req, res) => {
  const attendance = loadJSON(attendancePath);
  const groupedLogins = attendance.reduce((acc, log) => {
    const logDate = new Date(log.time); // Convert time string to Date object
    const dayOfWeek = logDate.toLocaleString('en-US', { weekday: 'long' }); // Get day of the week (e.g., Monday, Tuesday)
    const date = logDate.toISOString().split('T')[0]; // Get the date (YYYY-MM-DD)

    if (!acc[dayOfWeek]) {
      acc[dayOfWeek] = {}; // Initialize day if not yet
    }

    if (!acc[dayOfWeek][date]) {
      acc[dayOfWeek][date] = []; // Initialize date if not yet for the specific day
    }

    acc[dayOfWeek][date].push(log); // Add log to the respective day and date

    return acc;
  }, {});

  res.render('daily_logins', { groupedLogins });
});




app.get('/admin/approve-users', (req, res) => {
  const users = loadJSON(usersPath).filter((u) => !u.approved);
  res.render('approve_users', { users });
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
