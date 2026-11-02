
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISetting extends Document {
  key: string;
  value: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const settingSchema = new Schema<ISetting>(
  {
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
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const Setting: Model<ISetting> =
  mongoose.models.Setting ||
  mongoose.model<ISetting>('Setting', settingSchema);
