const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { spawn } = require('child_process');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// --- Middleware ---
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Database Connection ---
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/llm_db';
mongoose.connect(mongoURI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// --- Models ---
const ChatSchema = new mongoose.Schema({
    prompt: { type: String, required: true },
    response: { type: String, required: true },
    model: { type: String, default: 'Red' },
    timestamp: { type: Date, default: Date.now }
});
const Chat = mongoose.model('Chat', ChatSchema);

// --- Routes ---

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'active', timestamp: new Date() });
});

// Get Chat History
app.get('/api/history', async (req, res) => {
    try {
        const history = await Chat.find().sort({ timestamp: -1 }).limit(50);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Sample LLM Inference Route — calls the Python inference script
app.post('/api/generate', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log(`Generating response for: ${prompt}`);

    // Resolve path to the Python executable inside the venv
    const pythonBin = path.join(__dirname, '.venv', 'Scripts', 'python.exe');
    const scriptPath = path.join(__dirname, 'src', 'model', 'inference.py');

    // Forward HF_TOKEN so the Python side can authenticate with HuggingFace
    const childEnv = { ...process.env, HF_TOKEN: process.env.HF_TOKEN || '' };

    const python = spawn(pythonBin, [scriptPath, prompt], { env: childEnv });

    let output = '';
    let errorOutput = '';

    python.stdout.on('data', (data) => { output += data.toString(); });
    python.stderr.on('data', (data) => { errorOutput += data.toString(); });

    python.on('close', async (code) => {
        if (code !== 0) {
            console.error('Python error:', errorOutput);
            return res.status(500).json({ error: 'Inference failed', details: errorOutput });
        }
        
        const finalOutput = output.trim();
        
        // Save to History
        try {
            await Chat.create({ prompt, response: finalOutput });
        } catch (dbErr) {
            console.error('Failed to save to history:', dbErr);
        }

        res.json({ success: true, output: finalOutput });
    });

    python.on('error', (err) => {
        res.status(500).json({ error: 'Failed to start Python process', details: err.message });
    });
});

// --- Error Handling ---
app.use((req, res, next) => {
    res.status(404).json({ error: 'Route not found' });
});

// Express 5 note: error-handling middleware MUST keep all four parameters
// (err, req, res, next) — Express uses the arity to detect error handlers.
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;
