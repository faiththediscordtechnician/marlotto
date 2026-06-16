import React, { useEffect, useState } from 'react';

export default function UserSettings({ onBack }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingLabel, setEditingLabel] = useState(null);
  const [formData, setFormData] = useState({
    address_label: '',
    full_name: '',
    email: '',
    phone: '',
    street_address: '',
    city: '',
    state_province: '',
    zip_postal: '',
    country: '',
    date_of_birth: '',
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user-info');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setAddresses(data);
    } catch (err) {
      setError('Failed to load addresses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address) => {
    setEditingLabel(address.address_label);
    setFormData(address);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setError(null);
      const response = await fetch('/api/user-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save address');

      setEditingLabel(null);
      fetchAddresses();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setEditingLabel(null);
    setFormData({
      address_label: '',
      full_name: '',
      email: '',
      phone: '',
      street_address: '',
      city: '',
      state_province: '',
      zip_postal: '',
      country: '',
      date_of_birth: '',
    });
  };

  if (loading) {
    return <div className="form-container"><p>Loading...</p></div>;
  }

  return (
    <div>
      <button onClick={onBack} className="btn" style={{ marginBottom: '1.5rem' }}>
        ← Back
      </button>

      <div className="form-container mac-window">
        <div className="mac-titlebar">
          <div className="mac-buttons">
            <div className="mac-button mac-button-red"></div>
            <div className="mac-button mac-button-yellow"></div>
            <div className="mac-button mac-button-green"></div>
          </div>
          <div className="mac-title">📮 Mailing Addresses</div>
        </div>

        <div className="mac-content">
          {error && <div className="alert alert-error">{error}</div>}

          {editingLabel === null ? (
            <>
              <h2>Your Saved Addresses</h2>
              {addresses.length === 0 ? (
                <p style={{ color: 'var(--gray)' }}>No addresses saved yet. Add one to get started!</p>
              ) : (
                addresses.map((addr) => (
                  <div
                    key={addr.id}
                    style={{
                      background: 'var(--light-gray)',
                      padding: '1rem',
                      borderRadius: '4px',
                      marginBottom: '1rem',
                      border: '1px solid var(--gray)',
                    }}
                  >
                    <h3>{addr.address_label}</h3>
                    <p><strong>{addr.full_name}</strong></p>
                    <p>{addr.street_address}</p>
                    <p>{addr.city}, {addr.state_province} {addr.zip_postal}</p>
                    <p>{addr.country}</p>
                    <button
                      onClick={() => handleEdit(addr)}
                      className="btn btn-small"
                      style={{ marginTop: '0.5rem' }}
                    >
                      Edit
                    </button>
                  </div>
                ))
              )}

              <button
                onClick={() => {
                  setEditingLabel('new');
                  setFormData({
                    address_label: '',
                    full_name: '',
                    email: '',
                    phone: '',
                    street_address: '',
                    city: '',
                    state_province: '',
                    zip_postal: '',
                    country: '',
                    date_of_birth: '',
                  });
                }}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1rem' }}
              >
                + Add New Address
              </button>
            </>
          ) : (
            <>
              <h2>
                {editingLabel === 'new' ? '✏️ New Address' : `✏️ Edit ${formData.address_label}`}
              </h2>

              <div className="form-group">
                <label>Label (e.g., "Colorado", "Canada")</label>
                <input
                  type="text"
                  name="address_label"
                  value={formData.address_label}
                  onChange={handleChange}
                  placeholder="e.g., Colorado"
                />
              </div>

              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Street Address</label>
                <input
                  type="text"
                  name="street_address"
                  value={formData.street_address || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city || ''}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>State / Province</label>
                  <input
                    type="text"
                    name="state_province"
                    value={formData.state_province || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>ZIP / Postal Code</label>
                  <input
                    type="text"
                    name="zip_postal"
                    value={formData.zip_postal || ''}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Date of Birth (optional)</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="form-actions">
                <button onClick={handleSave} className="btn btn-primary">
                  💾 Save Address
                </button>
                <button onClick={handleCancel} className="btn">
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
