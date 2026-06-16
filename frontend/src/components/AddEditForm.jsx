import React, { useState } from 'react';
import { sweepstakesAPI } from '../api';

export default function AddEditForm({ onBack, onSaved }) {
  const [formData, setFormData] = useState({
    name: '',
    prize_value: '',
    deadline: '',
    mail_address_street: '',
    mail_address_city: '',
    mail_address_state: '',
    mail_address_zip: '',
    instructions: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Sweepstake name is required');
      return;
    }

    if (!formData.deadline) {
      setError('Deadline is required');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        prize_value: formData.prize_value ? parseInt(formData.prize_value) : null,
      };

      await sweepstakesAPI.create(payload);
      onSaved();
    } catch (err) {
      setError('Failed to create sweepstake');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-edit-form">
      <button onClick={onBack} className="btn btn-back">
        ← Back
      </button>

      <h2>Add New Sweepstake</h2>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Sweepstake Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Publishers Clearing House"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="prize_value">Prize Value ($)</label>
          <input
            type="number"
            id="prize_value"
            name="prize_value"
            value={formData.prize_value}
            onChange={handleChange}
            placeholder="Leave blank if unknown"
            min="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="deadline">Deadline *</label>
          <input
            type="date"
            id="deadline"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-section">
          <h3>Mailing Address</h3>

          <div className="form-group">
            <label htmlFor="mail_address_street">Street</label>
            <input
              type="text"
              id="mail_address_street"
              name="mail_address_street"
              value={formData.mail_address_street}
              onChange={handleChange}
              placeholder="P.O. Box or street address"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="mail_address_city">City</label>
              <input
                type="text"
                id="mail_address_city"
                name="mail_address_city"
                value={formData.mail_address_city}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="mail_address_state">State</label>
              <input
                type="text"
                id="mail_address_state"
                name="mail_address_state"
                value={formData.mail_address_state}
                onChange={handleChange}
                maxLength="2"
                placeholder="CA"
              />
            </div>

            <div className="form-group">
              <label htmlFor="mail_address_zip">ZIP Code</label>
              <input
                type="text"
                id="mail_address_zip"
                name="mail_address_zip"
                value={formData.mail_address_zip}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="instructions">Entry Instructions</label>
          <textarea
            id="instructions"
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            placeholder="Paste the entry instructions from the T&Cs..."
            rows="6"
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any additional notes..."
            rows="3"
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Creating...' : 'Create Sweepstake'}
          </button>
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="btn"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
