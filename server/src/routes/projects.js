import express from 'express';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ $or: [{ owner: req.user.id }, { members: req.user.id }] })
      .populate('owner', 'name')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Name is required' });
    const project = await Project.create({ name: name.trim(), description: description || '', owner: req.user.id, members: [] });
    await project.populate('owner', 'name');
    res.status(201).json(project);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('owner', 'name').populate('members', 'name');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!project.canView(req.user.id)) return res.status(403).json({ message: 'No access' });
    res.json(project);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!project.owner.equals(req.user.id)) return res.status(403).json({ message: 'Owner only' });
    project.name = req.body.name || project.name;
    project.description = req.body.description ?? project.description;
    await project.save();
    res.json(project);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!project.owner.equals(req.user.id)) return res.status(403).json({ message: 'Owner only' });
    await project.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:id/members', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('members', 'email');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!project.owner.equals(req.user.id)) return res.status(403).json({ message: 'Owner only' });
    const email = (req.body.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const member = await User.findOne({ email });
    if (!member) return res.status(404).json({ message: 'No account with that email' });
    if (member._id.equals(project.owner)) return res.status(400).json({ message: 'That is the owner' });
    if (project.members.some((m) => m._id.equals(member._id))) {
      return res.status(409).json({ message: 'Already a member' });
    }
    project.members.push(member._id);
    await project.save();
    await project.populate('members', 'name email');
    res.json(project.members);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id/members/:memberId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!project.owner.equals(req.user.id)) return res.status(403).json({ message: 'Owner only' });
    project.members = project.members.filter((m) => !m.equals(req.params.memberId));
    await project.save();
    await project.populate('members', 'name email');
    res.json(project.members);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:id/tasks', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project || !project.canView(req.user.id)) return res.status(403).json({ message: 'No access' });
    const title = (req.body.title || '').trim();
    if (!title) return res.status(400).json({ message: 'Title required' });
    project.tasks.push({ title, status: req.body.status || 'todo', assignee: req.body.assignee || '' });
    await project.save();
    res.status(201).json(project.tasks);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/tasks/:taskId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project || !project.canView(req.user.id)) return res.status(403).json({ message: 'No access' });
    const task = project.tasks.id(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (req.body.title !== undefined) task.title = req.body.title;
    if (req.body.status) task.status = req.body.status;
    if (req.body.assignee !== undefined) task.assignee = req.body.assignee;
    await project.save();
    res.json(project.tasks);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id/tasks/:taskId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project || !project.canView(req.user.id)) return res.status(403).json({ message: 'No access' });
    project.tasks.id(req.params.taskId).deleteOne();
    await project.save();
    res.json(project.tasks);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
