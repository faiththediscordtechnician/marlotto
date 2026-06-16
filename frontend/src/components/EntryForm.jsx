import React, { useEffect, useState } from 'react';

export default function EntryForm({ sweepstake, onSubmit, onCancel }) {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/user-info');
      const data = await response.json();
      if (response.ok && data.length > 0) {
        setAddresses(data);
        setSelectedAddressId(data[0].id);
        setSelectedAddress(data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (id) => {
    const addr = addresses.find((a) => a.id === id);
    setSelectedAddressId(id);
    setSelectedAddress(addr);
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 1500);
    });
  };

  const injectAutoFill = () => {
    if (!selectedAddress) {
      alert('Please select an address first');
      return;
    }

    const script = `
(function() {
  const data = ${JSON.stringify(selectedAddress)};

  // Helper to find and fill input by various patterns
  const fillField = (patterns, value) => {
    if (!value) return;
    const inputs = document.querySelectorAll('input, textarea, select');
    for (const input of inputs) {
      const name = input.name || input.id || input.placeholder || '';
      const match = patterns.some(p => name.toLowerCase().includes(p));
      if (match && input.offsetHeight > 0) {
        if (input.tagName === 'SELECT') {
          input.value = value;
        } else {
          input.value = value;
          input.dispatchEvent(new Event('change', { bubbles: true }));
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    }
  };

  // Fill common fields
  fillField(['email', 'mail'], data.email);
  fillField(['name', 'full_name'], data.full_name);
  fillField(['phone'], data.phone);
  fillField(['address', 'street'], data.street_address);
  fillField(['city'], data.city);
  fillField(['state', 'province', 'province'], data.state_province);
  fillField(['zip', 'postal', 'code'], data.zip_postal);
  fillField(['country'], data.country);
  fillField(['birth', 'dob', 'date_of_birth'], data.date_of_birth);

  alert('✨ Auto-fill complete! Review and submit the form.');
})();
`;

    const code = btoa(script);
    const bookmarklet = `javascript:(function(){const s=document.createElement('script');s.textContent=atob('${code}');document.head.appendChild(s);})()`;

    // Copy to clipboard
    navigator.clipboard.writeText(bookmarklet).then(() => {
      alert('📋 Auto-fill bookmarklet copied! Paste in your browser console or bookmark it.');
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    setIsRunning(false);
    onSubmit({
      addressUsed: selectedAddress?.address_label || 'colorado',
      timeSpentMinutes: Math.ceil(timer / 60),
      notes,
    });
  };

  if (loading) {
    return <div className="form-container"><p>Loading addresses...</p></div>;
  }

  if (addresses.length === 0) {
    return (
      <div className="form-container mac-window">
        <div className="mac-titlebar">
          <div className="mac-buttons">
            <div className="mac-button mac-button-red"></div>
            <div className="mac-button mac-button-yellow"></div>
            <div className="mac-button mac-button-green"></div>
          </div>
          <div className="mac-title">Entry Form Helper</div>
        </div>
        <div className="mac-content">
          <div className="alert alert-error">
            ⚠️ No addresses saved! Go to Settings to add your mailing address first.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container mac-window">
      <div className="mac-titlebar">
        <div className="mac-buttons">
          <div className="mac-button mac-button-red"></div>
          <div className="mac-button mac-button-yellow"></div>
          <div className="mac-button mac-button-green"></div>
        </div>
        <div className="mac-title">✍️ Entry Form Helper</div>
      </div>

      <div className="mac-content">
        <h2>Fill out: {sweepstake.name}</h2>

        {/* Timer */}
        <div
          style={{
            background: 'linear-gradient(135deg, #FFE4E1 0%, #FFD1DC 100%)',
            padding: '1rem',
            borderRadius: '4px',
            marginBottom: '1.5rem',
            border: '2px solid var(--hot-pink)',
            textAlign: 'center',
          }}
        >
          <p style={{ margin: '0 0 0.5rem 0', color: 'var(--gray)', fontSize: '0.85rem' }}>⏱️ TIME SPENT</p>
          <p style={{ margin: '0', fontSize: '2rem', fontWeight: 'bold', color: 'var(--darker-pink)' }}>
            {formatTime(timer)}
          </p>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="btn btn-small"
            style={{ marginTop: '0.5rem' }}
          >
            {isRunning ? '⏸️ Pause' : '▶️ Resume'}
          </button>
        </div>

        {/* Address Selector */}
        <div className="form-group">
          <label>📮 Which Address?</label>
          <select
            value={selectedAddressId || ''}
            onChange={(e) => handleAddressChange(parseInt(e.target.value))}
            className="filter-select"
          >
            {addresses.map((addr) => (
              <option key={addr.id} value={addr.id}>
                {addr.address_label} - {addr.full_name}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Address Fields */}
        {selectedAddress && (
          <div style={{ background: 'var(--light-gray)', padding: '1.5rem', borderRadius: '4px', marginBottom: '1.5rem' }}>
            <h3 style={{ marginTop: '0', color: 'var(--darker-pink)', marginBottom: '1rem' }}>
              📋 Info to Fill
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {[
                { label: 'Name', value: selectedAddress.full_name },
                { label: 'Email', value: selectedAddress.email },
                { label: 'Phone', value: selectedAddress.phone },
                { label: 'Street', value: selectedAddress.street_address },
                { label: 'City', value: selectedAddress.city },
                { label: 'State', value: selectedAddress.state_province },
                { label: 'ZIP', value: selectedAddress.zip_postal },
                { label: 'Country', value: selectedAddress.country },
              ].map(
                (field) =>
                  field.value && (
                    <div
                      key={field.label}
                      style={{
                        background: 'var(--white)',
                        padding: '0.8rem',
                        borderRadius: '4px',
                        border: '1px solid var(--gray)',
                      }}
                    >
                      <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.8rem', color: 'var(--gray)', fontWeight: 'bold' }}>
                        {field.label}
                      </p>
                      <p style={{ margin: '0 0 0.5rem 0', color: 'var(--darker-pink)', wordBreak: 'break-word' }}>
                        {field.value}
                      </p>
                      <button
                        onClick={() => copyToClipboard(field.value, field.label)}
                        className="btn btn-small"
                        style={{
                          background:
                            copiedField === field.label
                              ? 'linear-gradient(180deg, #00AA00 0%, #006600 100%)'
                              : 'var(--white)',
                          color: copiedField === field.label ? 'var(--white)' : 'var(--darker-pink)',
                          width: '100%',
                        }}
                      >
                        {copiedField === field.label ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                  )
              )}
            </div>
          </div>
        )}

        {/* Auto-Fill Button */}
        <div style={{ marginBottom: '1.5rem' }}>
          <button
            onClick={injectAutoFill}
            className="btn-primary"
            style={{ width: '100%', fontSize: '1rem', padding: '0.8rem' }}
          >
            🤖 Get Auto-Fill Bookmarklet
          </button>
          <p style={{ fontSize: '0.8rem', color: 'var(--gray)', marginTop: '0.5rem' }}>
            Opens in new tab? Right-click → "Copy Link Address", then paste in browser console
          </p>
        </div>

        {/* Notes */}
        <div className="form-group">
          <label>📝 Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes about this entry..."
            className="notes-textarea"
            style={{ minHeight: '80px' }}
          />
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <button onClick={handleSubmit} className="btn-primary">
            ✅ Done! Mark as Submitted
          </button>
          <button onClick={onCancel} className="btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
