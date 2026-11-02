import { AuditLog } from '../models/AuditLog.js';
function sanitizeSnapshot(value) {
    if (value == null)
        return null;
    const copy = JSON.parse(JSON.stringify(value));
    const sensitiveKeys = [
        'password',
        'token',
        'accessToken',
        'refreshToken',
        'authorization',
        'secret'
    ];
    const clean = (item) => {
        if (Array.isArray(item)) {
            return item.map(clean);
        }
        if (!item || typeof item !== 'object') {
            return item;
        }
        for (const key of Object.keys(item)) {
            if (sensitiveKeys.includes(key.toLowerCase())) {
                delete item[key];
            }
            else {
                item[key] = clean(item[key]);
            }
        }
        return item;
    };
    return clean(copy);
}
export async function writeAuditLog(input) {
    const user = input.req.user;
    if (!user?._id && !user?.id) {
        throw new Error('Cannot create audit log without an authenticated user.');
    }
    await AuditLog.create({
        actorId: user._id || user.id,
        actorName: user.name || 'Unknown user',
        actorEmail: user.email,
        actorRole: String(user.role || 'staff').toLowerCase(),
        action: input.action,
        module: input.module,
        recordId: input.recordId,
        recordLabel: input.recordLabel,
        description: input.description,
        before: sanitizeSnapshot(input.before),
        after: sanitizeSnapshot(input.after),
        ipAddress: input.req.ip,
        userAgent: input.req.get('user-agent'),
        requestId: input.req.get('x-request-id')
    });
}
