import mongoose, { Document, Schema } from "mongoose";

export interface IPushSubscription extends Document {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userId?: string;
  createdAt: Date;
}

const PushSubscriptionSchema: Schema = new Schema({
  endpoint: { type: String, required: true, unique: true },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true },
  },
  userId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IPushSubscription>("PushSubscription", PushSubscriptionSchema);
