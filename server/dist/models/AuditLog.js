import mongoose, { Schema } from 'mongoose';
const auditLogSchema = new Schema({
    actorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    actorName: {
        type: String,
        required: true,
        trim: true
    },
    actorEmail: {
        type: String,
        trim: true,
        lowercase: true
    },
    actorRole: {
        type: String,
        enum: ['admin', 'manager', 'staff'],
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    action: {
        type: String,
        enum: [
            'CREATE',
            'UPDATE',
            'DELETE',
            'LOGIN',
            'LOGOUT',
            'RESTORE'
        ],
        required: true,
        index: true
    },
    module: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    recordId: {
        type: String,
        index: true
    },
    recordLabel: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    before: {
        type: Schema.Types.Mixed,
        default: null
    },
    after: {
        type: Schema.Types.Mixed,
        default: null
    },
    ipAddress: String,
    userAgent: String,
    requestId: String
}, {
    timestamps: true,
    versionKey: false
});
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ module: 1, createdAt: -1 });
auditLogSchema.index({ actorId: 1, createdAt: -1 });
export const AuditLog = mongoose.models.AuditLog ||
    mongoose.model('AuditLog', auditLogSchema);
