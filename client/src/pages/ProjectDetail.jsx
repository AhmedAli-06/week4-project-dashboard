import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { IconTrash, IconPlus, IconEdit, IconX } from '@tabler/icons-react';
import api from '../api/client.js';
import Loading from '../components/Loading.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import Members from '../components/Members.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useAuth } from '../context/AuthContext.jsx';

const COLUMNS = [
  { key: 'todo', label: 'To do' },
  { key: 'inprogress', label: 'In progress' },
  { key: 'done', label: 'Done' },
];

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editTaskId, setEditTaskId] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', assignee: '' });
  const [dragTask, setDragTask] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [pendingTaskDelete, setPendingTaskDelete] = useState(null);
  const [pendingProjectDelete, setPendingProjectDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = () => {
    setProject(null);
    api.get(`/projects/${id}`)
      .then((r) => { setProject(r.data); setForm({ name: r.data.name, description: r.data.description || '' }); })
      .catch(() => setError('Could not load project.'));
  };
  useEffect(load, [id]);

  usePageTitle(project ? project.name : 'Project');

  const isOwner = project && user && project.owner && (project.owner._id === user._id);

  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim() || busy) return;
    setBusy(true);
    try {
      const r = await api.post(`/projects/${id}/tasks`, { title, assignee });
      setProject((p) => ({ ...p, tasks: r.data }));
      setTitle(''); setAssignee('');
    } catch {
      setError('Add task failed.');
    } finally {
      setBusy(false);
    }
  };

  const setStatus = async (taskId, status) => {
    try {
      const r = await api.put(`/projects/${id}/tasks/${taskId}`, { status });
      setProject((p) => ({ ...p, tasks: r.data }));
    } catch {  }
  };

  const saveTaskEdit = async () => {
    if (!editTaskId) return;
    setBusy(true);
    try {
      const r = await api.put(`/projects/${id}/tasks/${editTaskId}`, taskForm);
      setProject((p) => ({ ...p, tasks: r.data }));
      setEditTaskId(null);
    } catch {  }
    finally { setBusy(false); }
  };

  const delTask = async () => {
    if (!pendingTaskDelete) return;
    setBusy(true);
    try {
      const r = await api.delete(`/projects/${id}/tasks/${pendingTaskDelete}`);
      setProject((p) => ({ ...p, tasks: r.data }));
      setPendingTaskDelete(null);
    } catch { setPendingTaskDelete(null); }
    finally { setBusy(false); }
  };

  const saveProject = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api.put(`/projects/${id}`, form);
      setProject((p) => ({ ...p, name: r.data.name, description: r.data.description }));
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {  }
    finally { setBusy(false); }
  };

  const delProject = async () => {
    setBusy(true);
    try {
      await api.delete(`/projects/${id}`);
      navigate('/');
    } catch {
      setPendingProjectDelete(false);
      setBusy(false);
    }
  };

  if (error) return <div className="wrap page"><p className="error">{error}</p><Link to="/" className="btn">Back</Link></div>;
  if (!project) return <div className="wrap page"><Loading /></div>;

  const byStatus = (s) => project.tasks.filter((t) => t.status === s);

  const onDrop = (status) => {
    setDragOver(null);
    if (!dragTask) return;
    const task = project.tasks.find((t) => t._id === dragTask);
    if (task && task.status !== status) setStatus(dragTask, status);
    setDragTask(null);
  };

  return (
    <div className="wrap page">
      <div className="page-head">
        <div>
          <Link to="/" className="muted" style={{ fontSize: 14 }}>Projects</Link>
          <h1>{project.name}</h1>
          <p className="muted">{project.description}</p>
        </div>
        {isOwner && (
          <div className="row">
            <button className="btn" onClick={() => setEditing((x) => !x)}>
              {editing ? <><IconX size={16} /> Cancel</> : <><IconEdit size={16} /> Edit</>}
            </button>
            <button className="btn btn-danger" onClick={() => setPendingProjectDelete(true)}>
              <IconTrash size={16} /> Delete
            </button>
          </div>
        )}
      </div>

      {editing && (
        <form className="card stack" style={{ marginBottom: 22 }} onSubmit={saveProject}>
          <h3>Edit project</h3>
          <div className="field"><label htmlFor="en">Name</label><input id="en" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength="80" /></div>
          <div className="field"><label htmlFor="ed">Description</label><input id="ed" className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength="160" /></div>
          <div className="row"><button className="btn btn-primary btn-sm" type="submit" disabled={busy || !form.name.trim()}>{busy ? 'Savingâ€¦' : 'Save'}</button></div>
        </form>
      )}
      {saved && <p className="success">Project updated.</p>}

      <Members
        projectId={id}
        members={project.members}
        isOwner={isOwner}
        onChange={(next) => setProject((p) => ({ ...p, members: next }))}
      />

      <form className="card stack" style={{ marginBottom: 22 }} onSubmit={addTask}>
        <h3>Add task</h3>
        <div className="row">
          <div className="field" style={{ flex: 3 }}><label htmlFor="t">Title</label><input id="t" className="input" value={title} onChange={(e) => setTitle(e.target.value)} maxLength="120" /></div>
          <div className="field" style={{ flex: 2 }}><label htmlFor="a">Assignee</label><input id="a" className="input" value={assignee} onChange={(e) => setAssignee(e.target.value)} placeholder="Optional" /></div>
          <button className="btn btn-primary" type="submit" style={{ alignSelf: 'flex-end' }} disabled={!title.trim() || busy}>
            {busy ? 'Addingâ€¦' : <>Add <IconPlus size={16} /></>}
          </button>
        </div>
      </form>

      <div className="board">
        {COLUMNS.map((col) => (
          <div
            className={`col ${dragOver === col.key ? 'col-drop' : ''}`}
            key={col.key}
            onDragOver={(e) => { e.preventDefault(); setDragOver(col.key); }}
            onDragLeave={() => setDragOver((c) => (c === col.key ? null : c))}
            onDrop={() => onDrop(col.key)}
          >
            <h4>{col.label}<span className="muted">{byStatus(col.key).length}</span></h4>
            <div className="stack">
              {byStatus(col.key).map((t) => (
                <div
                  className={`card task ${dragTask === t._id ? 'task-dragging' : ''}`}
                  key={t._id}
                  draggable
                  onDragStart={() => setDragTask(t._id)}
                  onDragEnd={() => setDragTask(null)}
                >
                  {editTaskId === t._id ? (
                    <div className="stack" style={{ gap: 8 }}>
                      <input className="input" value={taskForm.title} onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))} aria-label="Task title" />
                      <input className="input" value={taskForm.assignee} onChange={(e) => setTaskForm((f) => ({ ...f, assignee: e.target.value }))} placeholder="Assignee" aria-label="Task assignee" />
                      <div className="row">
                        <button className="btn btn-primary btn-sm" onClick={saveTaskEdit} disabled={busy}>Save</button>
                        <button className="btn btn-sm" onClick={() => setEditTaskId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <strong>{t.title}</strong>
                      {t.assignee && <span className="assignee">{t.assignee}</span>}
                      <div className="row">
                        <select className="select" value={t.status} onChange={(e) => setStatus(t._id, e.target.value)} aria-label="Status">
                          {COLUMNS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                        </select>
                        <button className="icon-btn" style={{ padding: 5 }} onClick={() => { setEditTaskId(t._id); setTaskForm({ title: t.title, assignee: t.assignee || '' }); }} aria-label={`Edit ${t.title}`}>
                          <IconEdit size={14} />
                        </button>
                        <button className="icon-btn" style={{ padding: 5 }} onClick={() => setPendingTaskDelete(t._id)} aria-label={`Delete ${t.title}`}>
                          <IconTrash size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {byStatus(col.key).length === 0 && <p className="muted" style={{ fontSize: 13 }}>Drop tasks here</p>}
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal
        open={Boolean(pendingTaskDelete)}
        title="Delete task"
        body="The task will be removed from this board."
        confirmLabel="Delete"
        danger
        busy={busy}
        onConfirm={delTask}
        onCancel={() => setPendingTaskDelete(null)}
      />
      <ConfirmModal
        open={pendingProjectDelete}
        title="Delete project"
        body="The project, its tasks, and member access will be removed. This cannot be undone."
        confirmLabel="Delete project"
        danger
        busy={busy}
        onConfirm={delProject}
        onCancel={() => setPendingProjectDelete(false)}
      />
    </div>
  );
}