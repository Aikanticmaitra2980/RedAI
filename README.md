# RED AI — Local LLM Inference Platform

RED is a premium, dark-mode full-stack application designed for local Large Language Model inference. It features a modern React frontend, an Express backend, and a unified Python inference engine supporting both Transformers and Mistral.

## 🚀 Key Features

- **Unified Inference Engine**: Support for Hugging Face Transformers and the official `mistral_inference` library.
- **Premium UI**: Dark-mode dashboard with glassmorphism, animated glow effects, and a responsive chat interface.
- **Persistence**: Chat history is automatically saved to MongoDB.
- **Multi-Device Support**: Optimized for CUDA (GPU), MPS (Mac), and CPU.
- **Secure Configuration**: Integrated with `.env` and Hugging Face authentication.

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, TypeScript, Vanilla CSS (Premium Tokens).
- **Backend**: Node.js (Express 5), Mongoose (MongoDB).
- **AI/ML**: Python 3, PyTorch, Transformers, Mistral Inference.

## 📥 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- MongoDB (running locally or via Atlas)

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/llm_red
HF_TOKEN=your_huggingface_token
MISTRAL_MODELS_PATH=path/to/mistral/weights (optional)
```

### 3. Installation
```bash
# Install Node dependencies
npm install
cd frontend/RED && npm install

# Install Python dependencies
pip install -r requirements.txt
```

### 4. Running the App
Start the **entire stack** (Backend + Frontend) with a single command:
```bash
npm run ai
```

*Individual commands:*
- Backend: `npm run dev`
- Frontend: `npm run frontend`
- Python CLI: `npm run ai:cli`

## 📂 Project Structure

```text
├── app.js               # Express server & MongoDB models
├── models/
│   └── Red.py           # Unified Python model wrapper
├── src/
│   ├── model/
│   │   └── inference.py # CLI/Server inference script
│   └── data/            # Data processing scripts
├── frontend/RED/        # React + Vite frontend
└── .env                 # Secrets & Configuration
```

## 🤖 Model Integration

The system uses `distilgpt2` by default for fast local inference. To use Mistral:
1. Download Mistral weights.
2. Set `MISTRAL_MODELS_PATH` in `.env`.
3. The system will automatically detect and switch to the Mistral engine.

---
Built with ❤️ by Antigravity.
