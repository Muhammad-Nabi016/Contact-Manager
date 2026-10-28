
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

const client = new MongoClient(MONGODB_URI);

let contactsCollection;

// Validate contact information
function validateContact(body) {
  const { name, email, phone } = body;

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof phone !== "string" ||
    !name.trim() ||
    !email.trim() ||
    !phone.trim()
  ) {
    return "Name, email, and phone are required.";
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email.trim())) {
    return "Please provide a valid email address.";
  }

  return null;
}

// Check whether a MongoDB ID is valid
function isValidId(id) {
  return ObjectId.isValid(id) &&
    new ObjectId(id).toHexString() === id.toLowerCase();
}

// Root route
app.get("/", (req, res) => {
  res.send("Contact Manager Backend is running!");
});

// GET: Retrieve all contacts
app.get("/api/contacts", async (req, res) => {
  try {
    const contacts = await contactsCollection
      .find({})
      .sort({ name: 1 })
      .toArray();

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts.map((contact) => ({
        ...contact,
        _id: contact._id.toString(),
      })),
    });
  } catch (error) {
    console.error("Get contacts error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve contacts.",
    });
  }
});

// GET: Retrieve one contact
app.get("/api/contacts/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact ID.",
      });
    }

    const contact = await contactsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: { ...contact, _id: contact._id.toString() },
    });
  } catch (error) {
    console.error("Get contact error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve contact.",
    });
  }
});

// POST: Create a contact
app.post("/api/contacts", async (req, res) => {
  try {
    const validationError = validateContact(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const contact = {
      name: req.body.name.trim(),
      email: req.body.email.trim().toLowerCase(),
      phone: req.body.phone.trim(),
      createdAt: new Date(),
    };

    const result = await contactsCollection.insertOne(contact);

    res.status(201).json({
      success: true,
      message: "Contact created successfully.",
      data: {
        ...contact,
        _id: result.insertedId.toString(),
      },
    });
  } catch (error) {
    console.error("Create contact error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create contact.",
    });
  }
});

// PUT: Update a contact
app.put("/api/contacts/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact ID.",
      });
    }

    const validationError = validateContact(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const updatedContact = {
      name: req.body.name.trim(),
      email: req.body.email.trim().toLowerCase(),
      phone: req.body.phone.trim(),
    };

    const result = await contactsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedContact }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Contact not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact updated successfully.",
      data: { _id: id, ...updatedContact },
    });
  } catch (error) {
    console.error("Update contact error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update contact.",
    });
  }
});

// DELETE: Delete a contact
app.delete("/api/contacts/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact ID.",
      });
    }

    const result = await contactsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Contact not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact deleted successfully.",
    });
  } catch (error) {
    console.error("Delete contact error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete contact.",
    });
  }
});

// Connect to MongoDB before starting the server
async function startServer() {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from the .env file.");
    }

    await client.connect();

    const database = client.db("contactmanager");
    await database.command({ ping: 1 });

    contactsCollection = database.collection("contacts");

    console.log("MongoDB connected successfully!");
    console.log("Database: contactmanager");
    console.log("Collection: contacts");

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    await client.close().catch(() => {});
    process.exitCode = 1;
  }
}

startServer();
