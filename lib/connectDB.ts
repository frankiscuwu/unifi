import mongoose, { ConnectOptions, Mongoose } from "mongoose";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    throw new Error(
        "Please define the DATABASE_URL environment variable inside .env"
    );
}

// Extend the NodeJS global to include our mongoose cache
declare global {
    // eslint-disable-next-line no-var
    var mongoose: {
        conn: Mongoose | null;
        promise: Promise<Mongoose> | null;
    };
}

if (!global.mongoose) {
    global.mongoose = { conn: null, promise: null };
}

export async function connectDB(): Promise<Mongoose> {
    // If the connection is cached, use it
    if (global.mongoose.conn) {
        return global.mongoose.conn;
    }

    // Otherwise, create a new promise for the connection
    if (!global.mongoose.promise) {
        const opts: ConnectOptions = {
            bufferCommands: false,
            // useUnifiedTopology and useNewUrlParser are defaults in mongoose v6+
        };

        if (!DATABASE_URL) {
            throw new Error(
                "Please define the DATABASE_URL environment variable inside .env"
            );
        }

        global.mongoose.promise = mongoose
            .connect(DATABASE_URL, opts)
            .then((m) => m);
    }

    // Await the connection promise, cache it, then return
    global.mongoose.conn = await global.mongoose.promise;
    return global.mongoose.conn;
}

export default connectDB;
