import mongoose, { Document, Schema } from "mongoose";

export interface IAlert extends Document {
  title: string;
  description: string;
  timestamp: Date;
  type: string;
  location: string;
  createdBy: string;
}

const AlertSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ["fire", "flood", "earthquake", "landslide", "storm", "police", "accident", "other"],
  },
  location: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  createdBy: { type: String, required: true },
});

export default mongoose.model<IAlert>("Alert", AlertSchema);
