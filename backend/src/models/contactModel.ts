import mongoose, { Document, Schema } from "mongoose";

export interface IContact {
  name: string;
  phone: string;
  role?: string;
  description?: string;
}

export interface IContactInfo extends Document {
  localGovName: string;
  department: string;
  contacts: IContact[];
}

const ContactSchema: Schema = new Schema({
  name: { type: String },
  phone: { type: String, required: true },
  role: { type: String },
  description: { type: String },
});

const ContactInfoSchema: Schema = new Schema({
  localGovName: { type: String, required: true, index: true },
  department: { type: String, required: true, index: true },
  contacts: { type: [ContactSchema], default: [] },
}, { timestamps: true });

ContactInfoSchema.index({ localGovName: 1, department: 1 }, { unique: true });

export default mongoose.model<IContactInfo>("ContactInfo", ContactInfoSchema);
