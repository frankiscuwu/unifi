// !! RESTART after you edit this file for changes to take effect !!
import mongoose, { Schema, Document, Model } from "mongoose";


// TYPES
export interface IQueue extends Document {
    currentSong: [string, string, string];
    queue_data: [string, string, string][];
    devices: string[];
}

const QueueSchema = new Schema<IQueue>(
    {
        _id: { type: String, default: "QUEUE_SINGLETON" }, // force only one document
        currentSong: { type: [String, String, String], required: true, default: ["", ""] },
        queue_data: { type: mongoose.Schema.Types.Mixed, default: [] },
        devices: { type: mongoose.Schema.Types.Mixed, default: [] },
    },
    { timestamps: true, versionKey: false } 
);

export default (mongoose.models.Queue as Model<IQueue>) ||
    mongoose.model<IQueue>("Queue", QueueSchema);