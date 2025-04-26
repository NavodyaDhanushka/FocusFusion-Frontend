import React, { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, MapPin, Tag, Users, Edit2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/auth/useAuth";
import toast from "react-hot-toast";

//modal for creating/updating events
function EventModal({ open, onClose, onSubmit, initialData }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    category: "",
    maxParticipants: "",
  });

  useEffect(() => {
    if (initialData) setForm(initialData);
    else
      setForm({
        title: "",
        description: "",
        date: "",
        location: "",
        category: "",
        maxParticipants: "",
      });
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <motion.div
        className="bg-white rounded-lg shadow-lg w-full max-w-md p-6"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <h2 className="text-xl font-semibold mb-4">
          {initialData ? "Edit Event" : "Create Event"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Title"
            className="w-full border px-3 py-2 rounded"
            required
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full border px-3 py-2 rounded"
            required
          />
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Location"
            className="w-full border px-3 py-2 rounded"
            required
          />
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Category"
            className="w-full border px-3 py-2 rounded"
            required
          />
          <input
            type="number"
            name="maxParticipants"
            value={form.maxParticipants}
            onChange={handleChange}
            placeholder="Max Participants"
            className="w-full border px-3 py-2 rounded"
            required
          />
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              {initialData ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

//single event card
function EventCard({ event, onEdit, onDelete, onRegister }) {
  return (
    <div className="bg-white rounded-lg shadow p-5 flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-medium">{event.title}</h3>
        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
        <div className="flex flex-wrap items-center text-gray-500 text-xs mt-3 space-x-3">
          <span className="flex items-center space-x-1">
            <Calendar size={14} />
            <span>{new Date(event.date).toLocaleDateString()}</span>
          </span>
          <span className="flex items-center space-x-1">
            <MapPin size={14} />
            <span>{event.location}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Tag size={14} />
            <span>{event.category}</span>
          </span>
        </div>
      </div>
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => onRegister(event.id)}
          className="text-blue-600 text-sm hover:underline"
        >
          Register
        </button>
        <div className="flex space-x-2">
          <button onClick={() => onEdit(event)}>
            <Edit2 className="text-green-600 hover:text-green-800" size={18} />
          </button>
          <button onClick={() => onDelete(event.id)}>
            <Trash2 className="text-red-600 hover:text-red-800" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

//main events page
export default function EventsPage() {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const baseUrl = import.meta.env.VITE_BASE_URL + "/events";

  // Fetch all events
  useEffect(() => {
    axios
      .get(`${baseUrl}`)
      .then((res) => setEvents(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Create or Update
  const handleSubmit = (data) => {
    const call = data.id
      ? axios.put(`${baseUrl}/${data.id}/user/${currentUser.id}`, data)
      : axios.post(`${baseUrl}/user/${currentUser.id}`, data);

    call
      .then((res) => {
        toast.success(`Event ${data.id ? 'updated' : 'created'} successfully!`);
        return axios.get(`${baseUrl}`);
      })
      .then((res) => setEvents(res.data))
      .catch((err) => {
        toast.error(`Failed to ${data.id ? 'update' : 'create'} event.`);
      })
      .finally(() => {
        setModalOpen(false);
        setEditData(null);
      });
  };

  //delete
  const handleDelete = (id) => {
    axios
      .delete(`${baseUrl}/${id}/user/${currentUser.id}`)
      .then(() => {
        setEvents(events.filter((e) => e.id !== id));
        toast.success('Event deleted successfully!');
      })
      .catch((err) => {
        toast.error('Failed to delete event.');
      });
  };

  //register
  const handleRegister = (id) => {
    axios
      .post(`${baseUrl}/${id}/register/user/${currentUser.id}`)
      .then(() => toast.success("Registered successfully!"))
      .catch((err) => {
        toast.error("Failed to register for event.");
      });
  };

  if (loading) return <div className="p-6">Loading events...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Events</h2>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Create Event
        </button>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((evt) => (
          <EventCard
            key={evt.id}
            event={evt}
            onEdit={(e) => {
              setEditData({ ...e, id: e.id });
              setModalOpen(true);
            }}
            onDelete={handleDelete}
            onRegister={handleRegister}
          />
        ))}
      </div>

      <EventModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditData(null);
        }}
        onSubmit={handleSubmit}
        initialData={editData}
      />
    </div>
  );
}