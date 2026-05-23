// ─────────────────────────────────────────────────────────────────────────────
//  User Model – Authentication & Authorization
// ─────────────────────────────────────────────────────────────────────────────
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const sessionSchema = new mongoose.Schema(
  {
    token: { type: String, required: true },
    device: { type: String, default: 'unknown' },
    ip: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // don't return password by default
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'moderator'],
      default: 'user',
    },
    isBlocked: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 500 },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },
    sessions: [sessionSchema],
    searchHistory: [
      {
        query: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Workflow' }],
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

// ── Hash password before save ───────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Compare passwords ───────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
