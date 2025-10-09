const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors()); // Allow cross-origin if needed
app.use(express.json());

// Dummy API route
app.get('/api/hello', (req, res) => {
    console.log('req Headers', req.headers);
    res.json({ message: 'Hello from dummy backend-app1!' });
});

app.get('/api/app1', (req, res) => {
    console.log('req Headers', req.headers);
    res.json({ message: 'Hello from dummy backend-app1!' });
})

// Add more APIs here
app.listen(PORT, () => {
    console.log(`Dummy backend running on http://localhost:${PORT}`);
});
