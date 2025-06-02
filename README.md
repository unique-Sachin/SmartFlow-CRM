# SmartFlow CRM

SmartFlow CRM is an AI-powered customer relationship management platform designed to streamline your workflow, automate repetitive tasks, and provide intelligent insights for your business.

---

## 🚀 Live Demo

- **Frontend:** [https://smart-flow-crm-henna.vercel.app](https://smart-flow-crm-henna.vercel.app)
- **Backend:** [https://b41489dc-7ff6-4c32-be04-0d0003a7db41.e1-us-east-azure.choreoapps.dev](https://b41489dc-7ff6-4c32-be04-0d0003a7db41.e1-us-east-azure.choreoapps.dev)

---

## 🛠️ Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or above)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/smartflow-crm.git
cd smartflow-crm
```

### 2. Install Dependencies

#### For the Frontend

```bash
cd frontend
npm install
# or
yarn install
```

#### For the Backend

```bash
cd ../backend
npm install
# or
yarn install
```

### 3. Configure Environment Variables

#### Backend

Create a `.env` file in the `backend` directory based on the following template:

```env
# .env.example for SmartFlow CRM Backend

# MongoDB connection string
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<dbname>?retryWrites=true&w=majority

# JWT secret for authentication
JWT_SECRET=your_jwt_secret_here

# OpenAI API key for AI features
OPENAI_API_KEY=your_openai_api_key_here

# (Optional) Port for backend server
PORT=5000

# (Optional) Other third-party service keys
# EMAIL_API_KEY=your_email_api_key_here
# ANOTHER_SERVICE_KEY=your_service_key_here
```

#### Frontend

Create a `.env` file in the `frontend` directory based on the following template:

```env
# .env.example for SmartFlow CRM Frontend

# Base URL for the backend API
VITE_API_URL=http://localhost:5000/api

```

### 4. Run Locally

#### Start the Backend

```bash
cd backend
npm run dev
# or
yarn dev
```

#### Start the Frontend

```bash
cd ../frontend
npm run dev
# or
yarn dev
```

- The frontend will run at [http://localhost:5173/](http://localhost:5173/)
- The backend will typically run at [http://localhost:5000](http://localhost:5000) (or as configured)

---

## 🤖 AI Features Overview

SmartFlow CRM leverages advanced AI to supercharge your sales process and customer management. The following AI-powered features are implemented:

- **Deal Coach AI:**  
  Click on any deal to receive AI-generated next steps designed to improve the probability of closing the deal.

- **Customer Persona Builder:**  
  Automatically generates detailed behavioral profiles for leads based on their interaction history, helping you tailor your approach.

- **Objection Handler Recommender:**  
  Paste a customer objection and receive AI-suggested, convincing responses to help overcome sales hurdles.

- **Win-Loss Explainer:**  
  Get AI-driven explanations for why deals were won or lost, based on analysis of your data patterns.

- **AI Coach:**  
  Ask any question about CRM features, best practices, or how to use the system, and receive instant, AI-powered guidance and suggestions.

## Email Features (NEW)

### Sent Emails Page
- Access from the sidebar via the "Emails" link or at `/emails`.
- View a searchable, filterable table of all sent emails (to, subject, sender, date, status, type).
- Click "View" to see full email details and delivery status.

### Bulk Email Tool
- Available to Super Admin and Sales Manager roles.
- Click "Bulk Email" on the Sent Emails page to open the tool.
- Select multiple leads/contacts as recipients.
- Compose subject and message, or use AI to generate them.
- See per-recipient send results after sending.

### AI-Powered Email Generation
- In both single and bulk email modals, enter a prompt (e.g., "Announce new product, friendly and concise") and click "Generate with AI".
- The AI will generate a professional subject and message, which you can edit before sending.

### Email Logging
- All emails (manual, bulk, AI-generated) are logged in the system.
- The Sent Emails page shows all logs, including status (sent/failed) and error messages if any.

### Sidebar Navigation
- The sidebar now includes a direct link to the Sent Emails/Bulk Email page for easy access.

## Features

- **Role-based CRM**: Super Admin, Sales Manager, Sales Rep, Lead Specialist
- **Leads, Deals, Contacts, Reporting, Documents, AI Coach**
- **Real-time One-to-One Chat**:
  - Modern, responsive chat UI (React + MUI)
  - Message status: sent, delivered, read (with WhatsApp-style ticks)
  - Real-time updates via Socket.IO
  - Global in-app notifications for new messages (Snackbar)
  - Click notification to open chat with sender from anywhere
  - Message input auto-focuses when opening a chat
- **Socket.IO integration**: Robust backend and frontend setup
- **Global Notification System**: NotificationProvider for in-app alerts

## Setup

### Backend
1. `cd backend`
2. `npm install`
3. `npm run dev` (or `npm start` for production)
4. Ensure MongoDB is running

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`
4. Configure `.env` for `VITE_API_URL` and `VITE_SOCKET_URL` if needed

## Chat System Implementation

### Backend
- `ChatMessage` model now includes a `status` field (`sent`, `delivered`, `read`).
- Socket.IO events:
  - `chatMessage`: Send/receive messages, update status
  - `messageRead`: Mark messages as read
  - `messageStatusUpdate`: Real-time status updates
- Online user tracking for delivery/read receipts

### Frontend
- **SocketProvider**: Provides a live Socket.IO connection to the app
- **NotificationProvider**: Listens for chat messages globally, shows Snackbar notifications, and manages current chat user
- **Chat Page**:
  - User list, chat history, message input
  - Message status icons (✓ sent, ✓✓ delivered, ✓✓ green read)
  - Auto-focus on input when opening a chat
  - Responsive, modern UI with MUI
- **Global Notifications**:
  - Snackbar appears anywhere in the app for new messages
  - Clicking notification navigates to `/chat` and opens the correct conversation

## Extending the Chat System
- Add badges to sidebar for unread messages
- Add typing indicators, group chat, or file sharing
- Customize notification appearance or add sound

## Usage
- Log in as any user
- Open the Chat page from the sidebar
- Receive/send messages in real time
- Get notified of new messages anywhere in the app

---

For more details, see the code in `src/contexts/SocketContext.tsx`, `src/contexts/NotificationContext.tsx`, and `src/pages/Chat.tsx`. 