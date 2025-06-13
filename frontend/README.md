# EduGrowHub Frontend

React frontend application for EduGrowHub educational institute management system.

## Features

- **Superadmin Login**: Secure authentication with JWT tokens
- **Tailwind CSS**: Modern, responsive UI styling
- **React Hooks**: State management with useState
- **API Integration**: Connects to Spring Boot backend

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Backend Integration

The frontend is configured to proxy API requests to the backend server running on `http://localhost:8080`. Make sure your Spring Boot backend is running before testing the login functionality.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── SuperadminLogin.jsx
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

## Technologies Used

- React 18
- Tailwind CSS
- Create React App
- Fetch API for HTTP requests
