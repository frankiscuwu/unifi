// MongoDB schema for Mongoose bids
// !! RESTART after you edit this file for changes to take effect !!
import mongoose, { Schema, Document, Model } from "mongoose";


// TYPES
export interface IQueue extends Document {
    currentSong: string;
    queue_data: string[];
}

const QueueSchema = new Schema<IQueue>(
    {
        currentSong: { type: String, unique: true, required: true, index: true },
        queue_data: { type: mongoose.Schema.Types.Mixed, default: [] },
    },
    {
        timestamps: true
    }
);

export default (mongoose.models.Bid as Model<IQueue>) ||
    mongoose.model<IQueue>("Queue", QueueSchema);