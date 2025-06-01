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

---

## 📄 License

This project is licensed under the MIT License. 