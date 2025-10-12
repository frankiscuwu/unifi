import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route'; // import your authOptions
import connectDB from '@/lib/connectDB';
import Queue from '@/app/models/Queue';

export async function GET() {
    try {

        // Get the user session from NextAuth
        const session = await getServerSession(authOptions);

        if (!session?.accessToken) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        await connectDB();

        const queueDoc = await Queue.findById("QUEUE_SINGLETON");

        if (!queueDoc) {
            return NextResponse.json({ error: 'Queue not initialized' }, { status: 500 });
        }

        const queue = queueDoc.queue_data;

        return NextResponse.json({ queue });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
