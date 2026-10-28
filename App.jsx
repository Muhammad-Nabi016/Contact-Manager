
import { useState, useEffect, useCallback } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/contacts";

function App() {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Backend se contacts load karo
  const loadContacts = useCallback(async () => {
    try {
      setError("");

      const response = await fetch(API_URL);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Contacts load nahi ho sake.");
      }

      // Backend array ya { contacts: [...] } return kar sakta hai
      const list = Array.isArray(data) ? data : (data.contacts || data.data);

      if (!Array.isArray(list)) {
        throw new Error("Backend ka response expected format mein nahi hai.");
      }

      setContacts(list);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Backend se connection nahi ho raha. Check karo ke server chal raha hai."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Page open hone par contacts load karo
  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // Search
  const filteredContacts = contacts.filter((contact) =>
    `${contact.name} ${contact.email} ${contact.phone}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Add form kholo
  function openAddForm() {
    setEditingId(null);
    setFormData({ name: "", email: "", phone: "" });
    setError("");
    setShowForm(true);
  }

  // Edit form kholo
  function openEditForm(contact) {
    setEditingId(contact._id);
    setFormData({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
    });
    setError("");
    setShowForm(true);
  }

  // Form fields update karo
  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // Contact create ya update karo
  async function handleSubmit(event) {
    event.preventDefault();

    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();

    if (!name || !email || !phone) {
      setError("Please fill in all fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const isEditing = Boolean(editingId);

      const response = await fetch(
        isEditing ? `${API_URL}/${editingId}` : API_URL,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, phone }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Contact save nahi ho saka."
        );
      }

      await loadContacts();

      setShowForm(false);
      setEditingId(null);
      setFormData({ name: "", email: "", phone: "" });
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Backend se connection nahi ho raha."
          : err.message
      );
    } finally {
      setSaving(false);
    }
  }

  // Contact delete karo
  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this contact?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Contact delete nahi ho saka."
        );
      }

      await loadContacts();
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Backend se connection nahi ho raha."
          : err.message
      );
    }
  }

  return (
    <main className="app-container">
      <header className="topbar">
        <div>
          <p className="eyebrow">CONTACT MANAGEMENT</p>
          <h1>Contact Manager</h1>
          <p className="subtitle">
            Keep all your important contacts in one place.
          </p>
        </div>

        <button className="primary-btn" onClick={openAddForm}>
          + Add Contact
        </button>
      </header>

      <section className="stats-card">
        <div>
          <p>Total Contacts</p>
          <h2>{contacts.length}</h2>
        </div>
        <div className="stat-icon">👥</div>
      </section>

      <section className="contacts-section">
        <div className="section-heading">
          <div>
            <h2>My Contacts</h2>
            <p>Manage your saved contact information.</p>
          </div>

          <input
            className="search-input"
            type="search"
            placeholder="Search contacts..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}

        {showForm && (
          <form className="contact-form" onSubmit={handleSubmit}>
            <h3>{editingId ? "Edit Contact" : "Add New Contact"}</h3>

            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
              required
            />

            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              required
            />

            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              required
            />

            <div className="form-actions">
              <button
                className="primary-btn"
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Save Contact"}
              </button>

              <button
                className="secondary-btn"
                type="button"
                disabled={saving}
                onClick={() => {
                  setShowForm(false);
                  setError("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="empty-state">
                    Loading contacts...
                  </td>
                </tr>
              ) : filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => (
                  <tr key={contact._id}>
                    <td>
                      <div className="contact-name">
                        <span className="avatar">
                          {contact.name.charAt(0).toUpperCase()}
                        </span>
                        {contact.name}
                      </div>
                    </td>
                    <td>{contact.email}</td>
                    <td>{contact.phone}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-btn"
                          onClick={() => openEditForm(contact)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(contact._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="empty-state">
                    {search
                      ? "No matching contacts found."
                      : "No contacts yet. Click Add Contact to get started."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="footer">
        Contact Manager · Built with React, Express & MongoDB
      </footer>
    </main>
  );
}

export default App;
