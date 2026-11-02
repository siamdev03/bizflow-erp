import mongoose, { Schema } from 'mongoose';
const settingSchema = new Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    value: {
        type: Schema.Types.Mixed,
        required: true,
        default: {}
    }
}, {
    timestamps: true,
    versionKey: false
});
export const Setting = mongoose.models.Setting ||
    mongoose.model('Setting', settingSchema);
