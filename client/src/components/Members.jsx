import { useState } from 'react';
import { IconPlus, IconX } from '@tabler/icons-react';
import api from '../api/client.js';

export default function Members({ projectId, members, isOwner, onChange }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const add = async (e) => {
    e.preventDefault();
    if (!email.trim() || busy) return;
    setBusy(true); setError('');
    try {
      const r = await api.post(`/projects/${projectId}/members`, { email });
      onChange(r.data);
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add member.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (memberId) => {
    try {
      const r = await api.delete(`/projects/${projectId}/members/${memberId}`);
      onChange(r.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not remove member.');
    }
  };

  return (
    <div className="card" style={{ marginBottom: 22 }}>
      <h3>Members</h3>
      {error && <p className="error" style={{ marginTop: 0 }}>{error}</p>}
      <div className="row">
        <span className="member-chip"><strong>Owner</strong> (you)</span>
        {(members || []).map((m) => (
          <span className="member-chip" key={m._id}>
            {m.name || m.email}
            {isOwner && (
              <button className="chip-x" onClick={() => remove(m._id)} aria-label={`Remove ${m.name || m.email}`}>
                <IconX size={12} />
              </button>
            )}
          </span>
        ))}
        {(!members || members.length === 0) && <span className="muted" style={{ fontSize: 14 }}>No members yet.</span>}
      </div>
      {isOwner && (
        <form className="row" style={{ marginTop: 12 }} onSubmit={add}>
          <input
            className="input"
            type="email"
            placeholder="Add by email…"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Member email"
            style={{ flex: 1, minWidth: 220 }}
          />
          <button className="btn btn-primary btn-sm" type="submit" disabled={busy || !email.trim()}>
            {busy ? 'Adding…' : <>Add <IconPlus size={14} /></>}
          </button>
        </form>
      )}
    </div>
  );
}