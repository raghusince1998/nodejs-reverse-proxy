const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3002;

app.use(cors()); // Allow cross-origin if needed
app.use(express.json());

// Dummy API route
app.get('/app/hello', (req, res) => {
    console.log('req Headers', req.headers);
    res.json({ message: 'Hello from dummy backend-app2!' });
});

app.get('/app/app2', (req, res) => {
    console.log('req Headers', req.headers);
    res.json({ message: 'Hello from dummy backend-app2!' });
})

// Add more APIs here
app.listen(PORT, () => {
    console.log(`Dummy backend running on http://localhost:${PORT}`);
});
