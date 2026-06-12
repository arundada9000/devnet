import mongoose, { Document, Schema } from "mongoose";

export interface ISafeZone extends Document {
  name: string;
  type: "hospital" | "shelter" | "police" | "fire_station" | "distribution";
  location: {
    type: string;
    coordinates: [number, number];
  };
  address?: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SafeZoneSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["hospital", "shelter", "police", "fire_station", "distribution"],
    },
    location: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    address: { type: String },
    phone: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

SafeZoneSchema.index({ location: "2dsphere" });

export default mongoose.model<ISafeZone>("SafeZone", SafeZoneSchema);
