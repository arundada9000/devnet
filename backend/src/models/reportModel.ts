import mongoose, { Document, Schema } from "mongoose";

export interface IReport extends Document {
  type: string;
  description: string;
  rawDescription?: string;
  imageUrl?: string;
  imageId?: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  localGovName?: string;
  status: "pending" | "verified" | "solved" | "working" | "rejected";
  aiAnalysis?: {
    severityScore: number;
    isFake: boolean;
    tags: string[];
    summary: string;
  };
  userId?: string;
  reportedByPhone?: string;
  smsThread?: { message: string; receivedAt: Date }[];
  verifiedBy?: string;
  createdAt: Date; 
  updatedAt: Date;
}

const ReportSchema: Schema = new Schema({
  type: { type: String, required: true },
  description: { type: String, required: true },
  rawDescription: { type: String },
  imageUrl: { type: String },
  location: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  localGovName: { type: String, default: "Unknown" },
  status: {
    type: String,
    enum: ["pending", "verified", "solved", "working", "rejected"],
    default: "pending",
  },
  aiAnalysis: {
    severityScore: { type: Number },
    isFake: { type: Boolean },
    tags: { type: [String] },
    summary: { type: String },
  },
  userId: { type: String },
  reportedByPhone: { type: String },
  smsThread: [{ 
    message: { type: String },
    receivedAt: { type: Date, default: Date.now }
  }],
  verifiedBy: { type: String }},
  {
    timestamps: true,  
  }
);

// Create a 2dsphere index for geospatial queries
ReportSchema.index({ location: "2dsphere" });

export default mongoose.model<IReport>("Report", ReportSchema);
