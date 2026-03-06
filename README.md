# Rendix

Vocal AI Assistant for document processing and interaction.

## Features
- 🤖 AI-powered document analysis
- 📄 OCR text extraction  
- 🗣️ Text-to-speech conversion
- 🌍 Real-time translation
- 📝️ Document summarization
- 🔐 Secure authentication

## Tech Stack
- **Frontend**: React, Three.js, TailwindCSS
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL
- **AI**: OpenAI GPT, ElevenLabs TTS
- **Authentication**: JWT with bcrypt encryption

## Getting Started
1. Clone the repository
2. Install backend dependencies: `cd backend && pip install -r requirements.txt`
3. Install frontend dependencies: `cd frontend && npm install`
4. Start backend: `cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000`
5. Start frontend: `cd frontend && npm start`

## API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `POST /api/documents/upload` - Document upload
- `POST /api/ai/explain` - AI text explanation
- `POST /api/ai/translate` - Text translation

## License
MIT License - see LICENSE file for details
