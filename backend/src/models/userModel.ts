import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  username: string;
  password: string;
  phoneNumber?: string;
  role: "user" | "admin";
  localGovName?: string;
  email?: string;
  gender?: string;
  citizenshipId?: string;
  address?: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, unique: true, required: true },
  image_url: { type: String },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  localGovName: { type: String, default: "Unknown" },
  email: { type: String, default: "" },
  gender: { type: String, default: "" },
  citizenshipId: { type: String, default: "" },
  address: { type: String, default: "" },
  location: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], default: [0, 0] },
  },
}, { timestamps: true });

UserSchema.index({ location: "2dsphere" });

export default mongoose.model<IUser>("User", UserSchema);
