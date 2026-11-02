import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/index.js';
import { protect } from '../middleware/auth.js';
const router = Router();
const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'development_only_change_me', { expiresIn: '7d' });
router.post('/register', async (req, res, next) => { try {
    const body = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(8) }).parse(req.body);
    if (await User.exists({}))
        return res.status(403).json({ message: 'Registration is closed. Ask an administrator to create an account.' });
    const user = await User.create({ ...body, password: await bcrypt.hash(body.password, 12), role: 'admin' });
    res.status(201).json({ token: sign(user.id), user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}
catch (e) {
    next(e);
} });
router.post('/login', async (req, res, next) => { try {
    const body = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(req.body);
    const user = await User.findOne({ email: body.email }).select('+password');
    if (!user || !(await bcrypt.compare(body.password, user.password)))
        return res.status(401).json({ message: 'Invalid email or password' });
    res.json({ token: sign(user.id), user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}
catch (e) {
    next(e);
} });
router.get('/me', protect, (req, res) => res.json({ user: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role } }));
export default router;
