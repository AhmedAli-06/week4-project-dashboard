import bcrypt from 'bcryptjs';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import Project from './models/Project.js';

export async function seedData() {
  const count = await User.countDocuments();
  if (count > 0) return;
  const hash = await bcrypt.hash('Demo1234!', 10);
  const demo = await User.findOneAndUpdate(
    { email: 'demo@demo.com' },
    { name: 'Demo User', email: 'demo@demo.com', password: hash },
    { upsert: true, new: true }
  );
  const teammate = await User.findOneAndUpdate(
    { email: 'sam@demo.com' },
    { name: 'Sam Reyes', email: 'sam@demo.com', password: hash },
    { upsert: true, new: true }
  );
  await Project.create({
    name: 'Website Redesign',
    description: 'Refresh the marketing site and docs.',
    owner: demo._id,
    members: [],
    tasks: [
      { title: 'Audit current pages', status: 'done', assignee: 'Demo User' },
      { title: 'New color system', status: 'inprogress', assignee: 'Demo User' },
      { title: 'Write launch post', status: 'todo', assignee: '' },
    ],
  });
  await Project.create({
    name: 'Mobile App v2',
    description: 'Sprint planning for the next release.',
    owner: demo._id,
    members: [],
    tasks: [{ title: 'Set up CI', status: 'todo', assignee: 'Demo User' }],
  });
  console.log('[seed] Demo user + 2 projects ready (demo@demo.com / Demo1234!)');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  connectDB().then(() => seedData()).then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
}
