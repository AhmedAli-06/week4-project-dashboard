import mongoose from 'mongoose';
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  status: { type: String, enum: ['todo', 'inprogress', 'done'], default: 'todo' },
  assignee: { type: String, default: '' },
}, { timestamps: true });
const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  tasks: [taskSchema],
}, { timestamps: true });
projectSchema.methods.canView = function (userId) {
  return this.owner.equals(userId) || this.members.some((m) => m.equals(userId));
};
export default mongoose.model('Project', projectSchema);
