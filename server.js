
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Temporary in-memory storage
let contacts = [];
let nextId = 1;

// Root route
app.get("/", (req, res) => {
  res.send("Contact Manager Backend is running!");
});

// 1. GET: Get all contacts
app.get("/api/contacts", (req, res) => {
  res.status(200).json({
    success: true,
    count: contacts.length,
    data: contacts,
  });
});

// 2. GET: Get a single contact by ID
app.get("/api/contacts/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({
      success: false,
      message: "Invalid contact ID.",
    });
  }

  const contact = contacts.find((item) => item.id === id);

  if (!contact) {
    return res.status(404).json({
      success: false,
      message: "Contact not found.",
    });
  }

  res.status(200).json({
    success: true,
    data: contact,
  });
});

// 3. POST: Create a new contact
app.post("/api/contacts", (req, res) => {
  const { name, email, phone } = req.body;

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof phone !== "string" ||
    !name.trim() ||
    !email.trim() ||
    !phone.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "Name, email, and phone are required.",
    });
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone.trim();

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(cleanEmail)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address.",
    });
  }

  const contact = {
    id: nextId++,
    name: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
  };

  contacts.push(contact);

  res.status(201).json({
    success: true,
    message: "Contact created successfully.",
    data: contact,
  });
});

// 4. PUT: Update an existing contact
app.put("/api/contacts/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({
      success: false,
      message: "Invalid contact ID.",
    });
  }

  const contact = contacts.find((item) => item.id === id);

  if (!contact) {
    return res.status(404).json({
      success: false,
      message: "Contact not found.",
    });
  }

  const { name, email, phone } = req.body;

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof phone !== "string" ||
    !name.trim() ||
    !email.trim() ||
    !phone.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "Name, email, and phone are required.",
    });
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone.trim();

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(cleanEmail)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address.",
    });
  }

  contact.name = cleanName;
  contact.email = cleanEmail;
  contact.phone = cleanPhone;

  res.status(200).json({
    success: true,
    message: "Contact updated successfully.",
    data: contact,
  });
});

// 5. DELETE: Delete an existing contact
app.delete("/api/contacts/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({
      success: false,
      message: "Invalid contact ID.",
    });
  }

  const index = contacts.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Contact not found.",
    });
  }

  contacts.splice(index, 1);

  res.status(200).json({
    success: true,
    message: "Contact deleted successfully.",
  });
});

// Start server
const PORT = process.env.PORT || 5000;


async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
}

startServer();

