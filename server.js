const express = require('express');
const app = express();
const path = require('path');
const PORT = 3000;

app.use(express.json()); // Middleware to parse JSON bodies
app.set('view engine', 'ejs'); // Set EJS as the template engine
app.set('views', path.join(__dirname, 'views')); // Set the 'views' folder for EJS templates

// In-memory event store
let events = {
  newYear: new Date(new Date().getFullYear() + 1, 0, 1),
  valentinesDay: new Date(new Date().getFullYear(), 1, 14),
  halloween: new Date(new Date().getFullYear(), 9, 31),
  christmas: new Date(new Date().getFullYear(), 11, 25),
};

// Helper function to calculate the countdown
function getCountdown(eventDate) {
  const now = new Date();
  const timeDiff = eventDate - now;

  if (timeDiff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

// Routes

// Home page to show all events and countdown
app.get('/', (req, res) => {
  res.render('index', { events });
});

// Countdown for a specific event
app.get('/countdown/:event', (req, res) => {
  const eventName = req.params.event;
  const eventDate = events[eventName];

  if (!eventDate) {
    return res.status(404).json({ error: 'Event not found' });
  }

  const countdown = getCountdown(eventDate);
  res.render('countdown', { eventName, countdown });
});

// Get all events
app.get('/events', (req, res) => {
  res.json(events);
});

// Create a new event
app.post('/events', (req, res) => {
  const { name, date } = req.body;

  if (!name || !date) {
    return res.status(400).json({ error: 'Event name and date are required' });
  }

  events[name] = new Date(date);
  res.status(201).json({ message: 'Event created', event: { name, date } });
});

// Update an existing event
app.put('/events/:name', (req, res) => {
  const eventName = req.params.name;
  const { date } = req.body;

  if (!events[eventName]) {
    return res.status(404).json({ error: `Event '${eventName}' not found` });
  }

  if (!date) {
    return res.status(400).json({ error: 'New date is required to update the event' });
  }

  // Update the event date
  events[eventName] = new Date(date);
  res.json({ message: 'Event updated', event: { name: eventName, date: events[eventName] } });
});

// Delete an event
app.delete('/events/:name', (req, res) => {
  const eventName = req.params.name;

  if (!events[eventName]) {
    return res.status(404).json({ error: `Event '${eventName}' not found` });
  }

  // Delete the event
  delete events[eventName];
  res.json({ message: `Event '${eventName}' deleted` });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
