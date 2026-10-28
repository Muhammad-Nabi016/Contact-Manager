# Contact Manager App

A full-stack Contact Manager application built using React, Node.js, Express.js, and MongoDB. This application allows users to manage their contacts through a simple and responsive user interface.

## Features

- Add new contacts
- View all saved contacts
- Edit existing contact details
- Delete contacts
- Search contacts by name, email, or phone number
- Form validation
- REST API integration
- MongoDB database integration
- Persistent contact storage

## Technologies Used

**Frontend:**
- React.js
- Vite
- JavaScript
- CSS

**Backend:**
- Node.js
- Express.js
- MongoDB Native Driver
- CORS
- dotenv

## Project Structure

```text
Contact Manager/
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/
│   ├── index.js
│   ├── .env
│   ├── .gitignore
│   └── package.json
└── README.md
```

## Installation and Setup

### 1. Prerequisites

Make sure Node.js and npm are installed on your computer. You also need a MongoDB database, such as MongoDB Atlas.

### 2. Backend Setup

Open a terminal in the project folder and run:

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```

Replace the example connection string with your own MongoDB connection string. Never upload your actual credentials to GitHub.

### 3. Start the Backend Server

Run the following command inside the backend folder:

```bash
node index.js
```

The backend server should connect to MongoDB and run at:

`http://localhost:5000`

### 4. Frontend Setup

Open a second terminal and run:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL shown in the terminal, usually:

`http://localhost:5173`

Keep both frontend and backend servers running while using the application.

## API Endpoints

Base URL: `http://localhost:5000/api/contacts`

| HTTP Method | Endpoint | Description |
|---|---|---|
| GET | `/api/contacts` | Retrieve all contacts |
| GET | `/api/contacts/:id` | Retrieve a contact by ID |
| POST | `/api/contacts` | Create a new contact |
| PUT | `/api/contacts/:id` | Update an existing contact |
| DELETE | `/api/contacts/:id` | Delete a contact |

### Example Contact Data

```json
{
  "name": "Ali Ahmed",
  "email": "ali@example.com",
  "phone": "03001234567"
}
```

## Testing

The following features were tested during development:

- Loading contacts from MongoDB
- Adding new contacts
- Editing existing contacts
- Deleting contacts
- Searching contacts
- Refreshing the page and verifying that saved contacts remain available

## Security

- Keep MongoDB credentials in the backend `.env` file.
- Do not commit `.env` or expose database credentials publicly.
- Configure MongoDB Atlas network access appropriately.
- Review security and validation requirements before deploying the application publicly.

## Author

**Muhammad Nabi**

Developed as a Full Stack Web Development learning project.
