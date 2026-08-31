import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconPlus } from '@tabler/icons-react';
import api from '../api/client.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

function CardSkeleton() {
  return (
    <div className="col-4" aria-hidden="true">
      <div className="card">
        <div className="sk sk-line" style={{ width: '55%', margin: 0 }} />
        <div className="sk sk-line" />
        <div className="sk sk-line" style={{ width: '40%' }} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  usePageTitle('Projects');
  const [projects, setProjects] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => {
    setProjects(null);
    api.get('/projects').then((r) => setProjects(r.data)).catch(() => setError('Could not load projects.'));
  };
  useEffect(load, []);

  const create = async (e) => {
    e.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true);
    try {
      const r = await api.post('/projects', { name, description });
      setProjects((list) => [r.data, ...(list || [])]);
      setName('');
      setDescription('');
    } catch {
      setError('Create failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="wrap page">
      <div className="page-head"><h1>Projects</h1></div>
      {error && <p className="error">{error}</p>}
      <form className="card stack" style={{ marginBottom: 22 }} onSubmit={create}>
        <h3>New project</h3>
        <div className="row">
          <div className="field" style={{ flex: 2 }}><label htmlFor="pname">Name</label><input id="pname" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" maxLength="80" /></div>
          <div className="field" style={{ flex: 3 }}><label htmlFor="pdesc">Description</label><input id="pdesc" className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" maxLength="160" /></div>
          <button className="btn btn-primary" type="submit" style={{ alignSelf: 'flex-end' }} disabled={!name.trim() || busy}>
            {busy ? 'Adding…' : <>Add <IconPlus size={16} /></>}
          </button>
        </div>
      </form>
      {!projects && !error && (
        <div className="grid"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
      )}
      {projects && projects.length === 0 && <p className="state">No projects yet. Create one above.</p>}
      {projects && projects.length > 0 && (
        <>
          <div className="stats-row">
            <div className="stat"><strong>{projects.length}</strong><span className="muted">Projects</span></div>
            <div className="stat"><strong>{projects.reduce((n, p) => n + (p.tasks || []).length, 0)}</strong><span className="muted">Tasks</span></div>
            <div className="stat"><strong>{projects.reduce((n, p) => n + (p.tasks || []).filter((t) => t.status === 'done').length, 0)}</strong><span className="muted">Done</span></div>
            <div className="stat"><strong>{projects.reduce((n, p) => n + (p.tasks || []).filter((t) => t.status === 'inprogress').length, 0)}</strong><span className="muted">In progress</span></div>
          </div>
          <div className="grid">
            {projects.map((p) => {
              const total = (p.tasks || []).length;
              const done = (p.tasks || []).filter((t) => t.status === 'done').length;
              const pct = total === 0 ? 0 : Math.round((done / total) * 100);
              return (
                <div className="col-4" key={p._id}>
                  <Link to={`/project/${p._id}`} className="card project-card" style={{ display: 'block', textDecoration: 'none' }}>
                    <h3>{p.name}</h3>
                    <p>{p.description || 'No description.'}</p>
                    <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100" aria-label={`${pct}% done`}>
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="muted" style={{ marginTop: 8, marginBottom: 0 }}>
                      {done} of {total} task{total === 1 ? '' : 's'} done
                    </p>
                  </Link>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
