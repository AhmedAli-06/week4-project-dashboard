import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });
userSchema.methods.comparePassword = function (candidate) { return bcrypt.compare(candidate, this.password); };
userSchema.methods.toSafeJSON = function () { const o = this.toObject(); delete o.password; return o; };
export default mongoose.model('User', userSchema);
