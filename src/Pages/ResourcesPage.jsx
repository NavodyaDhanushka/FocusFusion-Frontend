import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import AuthContext from '../context/auth/AuthContext.js';
import { jsPDF } from 'jspdf';
import { FiDownload } from 'react-icons/fi';

const ResourcesPage = () => {
  const { currentUser, loading: authLoading } = useContext(AuthContext);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editUrl, setEditUrl] = useState('');

  const [searchQuery, setSearchQuery] = useState('');

  const baseUrl = import.meta.env.VITE_BASE_URL + '/resources';

  useEffect(() => {
    if (!authLoading && currentUser) fetchResources();
  }, [authLoading, currentUser]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(baseUrl);
      const list = Array.isArray(data)
          ? data
          : Array.isArray(data.resources)
              ? data.resources
              : [];
      setResources(list);
      toast.success('Resources Loaded Successfully');
    } catch (err) {
      setError(err.message || 'Unknown error');
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = { title: newTitle, description: newDescription, url: newUrl };
      const { data } = await axios.post(`${baseUrl}/user/${currentUser.id}`, payload);
      setResources(prev => [data, ...prev]);
      toast.success('Resource created');
      setShowCreate(false); setNewTitle(''); setNewDescription(''); setNewUrl('');
    } catch {
      toast.error('Failed to create');
    }
  };

  const startEdit = (resource) => {
    setEditingId(resource.id);
    setEditTitle(resource.title);
    setEditDescription(resource.description);
    setEditUrl(resource.url);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = { title: editTitle, description: editDescription, url: editUrl };
      const { data } = await axios.put(`${baseUrl}/${editingId}/user/${currentUser.id}`, payload);
      setResources(prev => prev.map(r => (r.id === editingId ? data : r)));
      toast.success('Resource updated');
      setEditingId(null);
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await axios.delete(`${baseUrl}/${id}/user/${currentUser.id}`);
      setResources(prev => prev.filter(r => r.id !== id));
      toast.success('Resource deleted');
    } catch {
      toast.error('Failed to delete resource');
    }
  };

  const handleDownloadPDF = (resource) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(resource.title, 10, 20);

    doc.setFontSize(14);
    doc.text("Description:", 10, 30);
    doc.setFontSize(12);
    doc.text(doc.splitTextToSize(resource.description, 180), 10, 38);

    doc.setFontSize(14);
    doc.text("URL:", 10, 60);
    doc.setFontSize(12);
    doc.text(resource.url, 10, 68);

    doc.save(`${resource.title.replace(/\s+/g, '_')}_resource.pdf`);
  };

  if (authLoading) return <p className="text-gray-500 p-6">Checking authentication...</p>;
  if (!currentUser) return <p className="text-red-600 p-6">You must be logged in.</p>;

  return (
      <div className="p-6 w-full max-w-4xl mx-auto">
        <Toaster position="top-right" />

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-semibold">Your Resources</h2>
          <button
              onClick={() => setShowCreate(prev => !prev)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {showCreate ? 'Cancel' : 'Add Resource'}
          </button>
        </div>

        {/* Search Input */}
        <div className="mb-4">
          <input
              type="text"
              placeholder="Search by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border rounded px-3 py-2"
          />
        </div>

        {showCreate && (
            <form onSubmit={handleCreate} className="bg-gray-50 p-4 mb-6 rounded shadow-inner">
              <div className="mb-4">
                <label className="block text-sm mb-1">Title</label>
                <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full border rounded px-3 py-2" required />
              </div>
              <div className="mb-4">
                <label className="block text-sm mb-1">Description</label>
                <textarea value={newDescription} onChange={e => setNewDescription(e.target.value)} className="w-full border rounded px-3 py-2" rows={3} required />
              </div>
              <div className="mb-4">
                <label className="block text-sm mb-1">URL</label>
                <input type="url" value={newUrl} onChange={e => setNewUrl(e.target.value)} className="w-full border rounded px-3 py-2" required />
              </div>
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Upload New Resource</button>
            </form>
        )}

        {loading && <p className="text-gray-500">Loading resources...</p>}
        {error && <p className="text-red-600">Error: {error}</p>}

        {!loading && !error && (
            resources.length === 0 ? (
                <p className="text-gray-500">No resources found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {resources
                      .filter(resource =>
                          resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          resource.description.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map(resource => (
                          <div key={resource.id} className="bg-white rounded-lg shadow-md p-5">
                            {editingId === resource.id ? (
                                <form onSubmit={handleUpdate} className="flex flex-col">
                                  <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="mb-2 border rounded px-2 py-1" required />
                                  <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} className="mb-2 border rounded px-2 py-1" rows={2} required />
                                  <input type="url" value={editUrl} onChange={e => setEditUrl(e.target.value)} className="mb-2 border rounded px-2 py-1" required />
                                  <div className="flex justify-end space-x-2">
                                    <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400">Cancel</button>
                                    <button type="submit" className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">Save</button>
                                  </div>
                                </form>
                            ) : (
                                <div className="flex flex-col justify-between h-full">
                                  <div>
                                    <h3 className="text-xl font-bold mb-2">{resource.title}</h3>
                                    <p className="text-gray-700 mb-4">{resource.description}</p>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">Visit</a>
                                    <div className="flex flex-wrap gap-2">
                                      <button
                                          onClick={() => handleDownloadPDF(resource)}
                                          className="bg-purple-600 text-white p-2 rounded hover:bg-purple-700"
                                          title="Download as PDF"
                                      >
                                        <FiDownload size={18} />
                                      </button>

                                      <button onClick={() => startEdit(resource)} className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">Edit</button>
                                      <button onClick={() => handleDelete(resource.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Delete</button>
                                    </div>
                                  </div>
                                </div>
                            )}
                          </div>
                      ))}
                </div>
            )
        )}
      </div>
  );
};

export default ResourcesPage;
