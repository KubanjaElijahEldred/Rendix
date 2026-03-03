# API Keys Setup Guide for Rendix

## 📋 Required API Keys

### 1. OpenAI API Key (Required for AI features)

**How to get:**
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Give it a name like "Rendix Development"
5. Copy the generated key (starts with `sk-`)

**Features used:**
- Text explanations
- Translations  
- Report generation
- Content analysis

**Cost:** Very affordable (~$0.002 per 1K tokens for GPT-3.5)

---

### 2. ElevenLabs API Key (Required for voice features)

**How to get:**
1. Go to [ElevenLabs](https://elevenlabs.io/app/settings/api-keys)
2. Sign up or log in
3. Go to Settings → API Keys
4. Click "Create New API Key"
5. Copy the generated key

**Features used:**
- High-quality text-to-speech
- Natural voice generation
- Multiple voice options

**Cost:** Free tier includes 10,000 characters/month, then $0.30 per 1K characters

---

## 🔧 Configuration Steps

### Option 1: Edit .env directly
```bash
# Navigate to backend directory
cd /home/kubanja-elijah-eldred/Desktop/Rendix/backend

# Copy the example file
cp .env.example .env

# Edit with your actual keys
nano .env
```

### Option 2: Use environment variables (recommended for production)
```bash
# Set environment variables
export OPENAI_API_KEY="your_actual_openai_key"
export ELEVENLABS_API_KEY="your_actual_elevenlabs_key"

# Or add to your shell profile (~/.bashrc or ~/.zshrc)
echo 'export OPENAI_API_KEY="your_actual_openai_key"' >> ~/.bashrc
echo 'export ELEVENLABS_API_KEY="your_actual_elevenlabs_key"' >> ~/.bashrc
```

### Option 3: Create a .env.local file (git-safe)
```bash
# Create local environment file (won't be committed to git)
cat > .env.local << EOF
OPENAI_API_KEY=your_actual_openai_key
ELEVENLABS_API_KEY=your_actual_elevenlabs_key
EOF
```

## 🗄️ Database Setup

### For Development (SQLite - Easy Start)
```bash
# No additional setup needed - SQLite will be created automatically
DATABASE_URL=sqlite:///./rendix.db
```

### For Production (PostgreSQL - Recommended)
```bash
# Install PostgreSQL
sudo apt update && sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE rendix_db;
CREATE USER rendix_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE rendix_db TO rendix_user;
\q

# Update your .env
DATABASE_URL=postgresql://rendix_user:your_password@localhost:5432/rendix_db
```

## 🚀 Quick Start Commands

### 1. Configure your keys
```bash
cd /home/kubanja-elijah-eldred/Desktop/Rendix/backend

# Choose one of the options above to set your keys
```

### 2. Install dependencies (with basic requirements first)
```bash
# Start with just the essential packages
source venv/bin/activate
pip install fastapi uvicorn python-multipart python-dotenv

# Then try the full requirements later
pip install -r requirements.txt
```

### 3. Initialize database
```bash
# Create the database tables
python -c "from app.models.database import create_tables; create_tables()"
```

### 4. Start the server
```bash
# Start the FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 🔍 Testing Your Setup

### Test API Health
```bash
curl http://localhost:8000/health
```

### Test API Documentation
Open your browser to: http://localhost:8000/docs

## ⚠️ Security Notes

- **Never commit API keys to git**
- **Use environment variables in production**
- **Rotate keys regularly**
- **Monitor usage on both platforms**

## 🆘️ Troubleshooting

### Common Issues:
1. **"Module not found" errors** → Make sure you're in the virtual environment
2. **"API key invalid"** → Check for extra spaces or missing characters
3. **"Network timeout"** → Try installing packages one by one
4. **"Database connection failed"** → Verify PostgreSQL is running and credentials are correct

### Get Help:
- Check the logs: `uvicorn app.main:app --log-level debug`
- Join our Discord: [Link to Discord]
- Create an issue: [GitHub Issues]

---

**🎉 Once configured, your Rendix Vocal AI Assistant will be ready to use!**
