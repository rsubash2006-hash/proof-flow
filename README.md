# ProofFlow
### Every transaction. One clear picture.

ProofFlow is an AI-assisted payment investigation and reconciliation dashboard designed to help users review payment transactions, organize supporting evidence, record investigation decisions, and understand potential transaction concerns.

## Features

- **Transaction Dashboard:** View and review payment transactions in one workspace.
- **PayPal Sandbox Integration:** Connect to the PayPal Sandbox API and retrieve available transaction records.
- **AI-Powered Analysis:** Use Google Gemini to generate transaction investigation reports.
- **Investigation Management:** Update transaction status, add investigation notes, and record decisions.
- **Data Persistence:** Preserve transaction investigation details using browser local storage.
- **Interactive UI:** Dark-themed dashboard with a responsive interface and LightPillar visual effects.
- **Account Interface:** Demo login, registration, profile, and session functionality.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, Vite |
| Backend | Python, FastAPI |
| Payment Integration | PayPal Sandbox REST API |
| AI Integration | Google Gemini API |
| Styling | CSS |
| Data Persistence | Browser Local Storage |
| Development Tools | VS Code, Git, GitHub |

## Project Architecture

```text
ProofFlow/
│
├── src/
│   ├── App.jsx
│   ├── index.css
│   └── components/
│
├── backend/
│   ├── main.py
│   ├── pyproject.toml
│   └── .env
│
├── package.json
├── vite.config.js
└── README.md
```

*The structure above is a simplified overview of the main project files.*

## Running the Project on Windows

### 1. Frontend Setup

Open the project root folder in VS Code.

Install dependencies:

```powershell
npm.cmd install
```

Start the frontend:

```powershell
npm.cmd run dev
```

Open the local URL displayed by Vite, usually:

```text
http://localhost:5173
```

### 2. Backend Setup

Open a second terminal:

```powershell
cd backend
```

Start the FastAPI server using the configured Python environment:

```powershell
.\.venv312\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
```

The backend runs at:

```text
http://127.0.0.1:8000
```

### 3. API Configuration

Configure the required credentials in the backend environment file:

- PayPal Sandbox credentials.
- Google Gemini API key.

Keep API keys private. Never upload `.env` files or secret credentials to GitHub.

## How ProofFlow Works

1. The frontend communicates with the FastAPI backend.
2. The backend requests available transaction records from PayPal Sandbox.
3. Transaction information is displayed in the ProofFlow dashboard.
4. Users can review transactions and update investigation statuses.
5. Investigation notes and relevant details are preserved in browser storage.
6. Gemini AI can analyze a selected transaction and generate an investigation report.

## Current Limitations

- PayPal integration currently uses the Sandbox environment, not live payments.
- Gemini analysis depends on API availability and free-tier usage limits.
- Authentication is currently a demonstration implementation, not production-grade authentication.
- Investigation data is stored in browser local storage rather than a production database.
- AI-generated findings are suggestions and require human verification.
- The application is a prototype and is not intended for processing real financial transactions.

## Future Improvements

- Database integration for persistent transaction storage.
- Secure user authentication and authorization.
- Improved transaction evidence management.
- More comprehensive AI investigation reports.
- Production deployment and security improvements.

## Developer

**Project:** ProofFlow  
**Purpose:** AI-assisted payment investigation and reconciliation  
**Status:** Academic project prototype

---

*ProofFlow — Make every payment traceable.*