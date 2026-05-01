import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Users, CreditCard, Settings, Search, Bell, Menu, MoreVertical, Edit2, Trash2, Mail, Loader2, ArrowUpRight, Plus, MapPin, X, Save } from 'lucide-react';
import './App.css';

const MOCK_DATA = {
    "success": true,
    "message": "Operación exitosa",
    "data": [
        {
            "id": 5,
            "created_at": "2026-05-01T03:42:08.695619Z",
            "updated_at": "2026-05-01T03:42:08.695646Z",
            "first_name": "Calson",
            "last_name": "Chino",
            "email": "asdas@ASA.com",
            "document_number": "55656",
            "address": "Grecia Cerro Cerro 2122"
        },
        {
            "id": 4,
            "created_at": "2026-04-30T22:12:50.933135Z",
            "updated_at": "2026-04-30T22:12:50.933158Z",
            "first_name": "Juan",
            "last_name": "Pérez",
            "email": "juan.perez@ejemplo.com",
            "document_number": "12345678",
            "address": "Calle Falsa 123, Ciudad de Prueba"
        },
        {
            "id": 3,
            "created_at": "2026-04-27T22:05:37.323217Z",
            "updated_at": "2026-04-27T22:05:37.323241Z",
            "first_name": "Juan",
            "last_name": "Perez",
            "email": "juan@example.com",
            "document_number": "12345678-9",
            "address": null
        },
        {
            "id": 2,
            "created_at": "2026-04-27T20:27:52.887348Z",
            "updated_at": "2026-04-27T20:27:52.887369Z",
            "first_name": "Nelson",
            "last_name": "ElNegro",
            "email": "masdd@asdasd.com",
            "document_number": "23423423",
            "address": "adasdas"
        },
        {
            "id": 1,
            "created_at": "2026-04-27T20:27:16.268462Z",
            "updated_at": "2026-04-27T20:27:16.268487Z",
            "first_name": "szdz",
            "last_name": "asdad",
            "email": "dasdad@gmail.com",
            "document_number": "asda",
            "address": "asdasd"
        }
    ],
    "meta": { "count": 5 }
};

function App() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    document_number: '',
    address: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (customer) => {
    setIsEditMode(true);
    setEditingCustomerId(customer.id);
    setFormData({
      first_name: customer.first_name,
      last_name: customer.last_name,
      email: customer.email,
      document_number: customer.document_number,
      address: customer.address || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        // Update existing customer
        const response = await axios.patch(`http://localhost:8000/api/customers/${editingCustomerId}/`, formData);
        if (response.data.success || response.status === 200) {
          const updatedCustomer = response.data.data || { 
            id: editingCustomerId, 
            created_at: customers.find(c => c.id === editingCustomerId)?.created_at,
            updated_at: new Date().toISOString(),
            ...formData 
          };
          setCustomers(prev => prev.map(c => c.id === editingCustomerId ? updatedCustomer : c));
          setIsModalOpen(false);
          setIsEditMode(false);
          setEditingCustomerId(null);
          setFormData({ first_name: '', last_name: '', email: '', document_number: '', address: '' });
        }
      } else {
        // Create new customer
        const response = await axios.post('http://localhost:8000/api/customers/', formData);
        if (response.data.success || response.status === 201 || response.status === 200) {
          const newCustomer = response.data.data || { 
            id: customers.length + 10, 
            created_at: new Date().toISOString(), 
            ...formData 
          };
          setCustomers(prev => [newCustomer, ...prev]);
          setIsModalOpen(false);
          setFormData({ first_name: '', last_name: '', email: '', document_number: '', address: '' });
        }
      }
    } catch (err) {
      console.error("API error, fallback to local update.");
      if (isEditMode) {
        setCustomers(prev => prev.map(c => c.id === editingCustomerId ? { ...c, ...formData } : c));
      } else {
        const newCustomer = { 
          id: customers.length + 10, 
          created_at: new Date().toISOString(), 
          ...formData 
        };
        setCustomers(prev => [newCustomer, ...prev]);
      }
      setIsModalOpen(false);
      setIsEditMode(false);
      setEditingCustomerId(null);
      setFormData({ first_name: '', last_name: '', email: '', document_number: '', address: '' });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Attempt to fetch from API, fallback to mock data
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        // Typical Django local port is 8000
        const response = await axios.get('http://localhost:8000/api/customers/');
        if (response.data.success) {
          setCustomers(response.data.data);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.log("Could not connect to localhost API, using provided data payload.");
        setTimeout(() => {
          setCustomers(MOCK_DATA.data);
          setLoading(false);
        }, 1200); // Simulate network delay for animations to show up
      } 
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.first_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.document_number.includes(searchQuery) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (first, last) => {
    return `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`.toUpperCase();
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="sidebar glass-panel"
      >
        <div className="sidebar-logo">
          <div className="icon">
            <LayoutDashboard size={24} />
          </div>
          <span>AcmeCorp</span>
        </div>
        <nav className="nav-menu">
          <div className="nav-item">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </div>
          <div className="nav-item active">
            <Users size={20} />
            <span>Customers</span>
          </div>
          <div className="nav-item">
            <CreditCard size={20} />
            <span>Billing</span>
          </div>
          <div className="nav-item">
            <Settings size={20} />
            <span>Settings</span>
          </div>
        </nav>
      </motion.aside>

      {/* Main Content */}
      <main className="main-content">
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="top-header"
        >
          <div className="page-title">
            <h1>Customer Directory</h1>
            <p>Manage and view your platform users ({customers.length} total)</p>
          </div>

          <div className="header-actions">
            <div className="search-bar">
              <Search size={18} color="var(--text-muted)" />
              <input 
                type="text" 
                placeholder="Search customers..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="btn btn-outline" style={{ padding: '10px' }}>
              <Bell size={18} />
            </button>
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} /> Add Customer
            </button>
          </div>
        </motion.header>

        {/* Overview Stats */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}
        >
          <div className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 500 }}>Total Active</p>
              <h2 style={{ fontSize: '2.2rem', margin: 0 }}>{loading ? '--' : customers.length}</h2>
            </div>
            <div style={{ background: 'var(--accent-glow)', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
              <Users size={28} />
            </div>
          </div>
          <div className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 500 }}>Recent Signups</p>
              <h2 style={{ fontSize: '2.2rem', margin: 0 }}>{loading ? '--' : '3'}</h2>
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
              <ArrowUpRight size={28} />
            </div>
          </div>
          <div className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 500 }}>Verification Rate</p>
              <h2 style={{ fontSize: '2.2rem', margin: 0 }}>{loading ? '--' : '94%'}</h2>
            </div>
            <div style={{ background: 'rgba(99, 102, 241, 0.15)', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
              <Settings size={28} />
            </div>
          </div>
        </motion.div>

        {/* Data Table */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="table-container glass-card"
        >
          {loading ? (
            <div className="loading-state fade-in">
              <Loader2 size={36} className="spinner" />
              <p>Loading beautifully formatted databank...</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact Information</th>
                  <th>Document ID</th>
                  <th>Location</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredCustomers.map((customer, index) => (
                    <motion.tr 
                      key={customer.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="row-anim"
                    >
                      <td>
                        <div className="user-cell">
                          <div className="avatar">
                            {getInitials(customer.first_name, customer.last_name)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '1rem' }}>
                              {customer.first_name} {customer.last_name}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '6px', alignItems: 'center' }}>
                              ID: #{customer.id.toString().padStart(4, '0')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                           <Mail size={16} />
                           {customer.email}
                        </div>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '1rem', color: 'var(--text-primary)' }}>
                        {customer.document_number}
                      </td>
                      <td>
                        {customer.address ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                             <MapPin size={16} color="var(--text-muted)" />
                             <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                               {customer.address}
                             </span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not provided</span>
                        )}
                      </td>
                      <td>
                        {formatDate(customer.created_at)}
                      </td>
                      <td>
                        <span className="badge badge-success">Active</span>
                      </td>
                      <td>
                        <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
                          <button className="action-btn" title="Edit Customer" onClick={() => handleEditClick(customer)}>
                            <Edit2 size={18} />
                          </button>
                          <button className="action-btn delete" title="Delete Customer">
                            <Trash2 size={18} />
                          </button>
                          <button className="action-btn" title="More Options">
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                  {filteredCustomers.length === 0 && (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <td colSpan="7" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                          <Search size={32} opacity={0.5} />
                          <p>No customers found matching your search criteria.</p>
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </motion.div>
      </main>

      {/* Add Customer Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="modal-content glass-panel"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <div className="modal-header">
                <h2>{isEditMode ? 'Edit Customer' : 'Add New Customer'}</h2>
                <button className="close-btn" onClick={() => {
                  setIsModalOpen(false);
                  setIsEditMode(false);
                  setEditingCustomerId(null);
                  setFormData({ first_name: '', last_name: '', email: '', document_number: '', address: '' });
                }}>
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input type="text" name="first_name" className="form-input" required value={formData.first_name} onChange={handleInputChange} placeholder="John" />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input type="text" name="last_name" className="form-input" required value={formData.last_name} onChange={handleInputChange} placeholder="Doe" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" name="email" className="form-input" required value={formData.email} onChange={handleInputChange} placeholder="john@example.com" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Document Number</label>
                    <input type="text" name="document_number" className="form-input" required value={formData.document_number} onChange={handleInputChange} placeholder="12345678" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Physical Address</label>
                  <input type="text" name="address" className="form-input" value={formData.address} onChange={handleInputChange} placeholder="123 Main St, City" />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline" onClick={() => {
                    setIsModalOpen(false);
                    setIsEditMode(false);
                    setEditingCustomerId(null);
                    setFormData({ first_name: '', last_name: '', email: '', document_number: '', address: '' });
                  }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="spinner" size={18} /> : <Save size={18} />}
                    {isSubmitting ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Customer' : 'Save Customer')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default App;
