import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
export async function protect(req, res, next) {
    try {
        const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : '';
        if (!token)
            return res.status(401).json({ message: 'Authentication required' });
        const secret = process.env.JWT_SECRET || 'development_only_change_me';
        const payload = jwt.verify(token, secret);
        const user = await User.findById(payload.id);
        if (!user || !user.active)
            return res.status(401).json({ message: 'User not found or inactive' });
        req.user = user;
        next();
    }
    catch {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}
export function allowRoles(...roles) { return (req, res, next) => { if (!req.user || !roles.includes(req.user.role))
    return res.status(403).json({ message: 'Insufficient permissions' }); next(); }; }
