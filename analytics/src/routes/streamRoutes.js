const router = require('express').Router();
const Visit = require('../models/Visit');

// ─── Connected SSE Clients ─────────────────────────────────────────────────────

const clients = new Set();

router.get('/stream', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
    });

    // Send initial heartbeat
    res.write(': connected\n\n');

    clients.add(res);

    // Heartbeat every 30s to keep connection alive
    const heartbeat = setInterval(() => res.write(': heartbeat\n\n'), 30000);

    req.on('close', () => {
        clearInterval(heartbeat);
        clients.delete(res);
    });
});


// ─── Broadcast Helper ──────────────────────────────────────────────────────────

function broadcast(event, data) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of clients) {
        client.write(payload);
    }
}


// ─── Change Stream Watcher ─────────────────────────────────────────────────────

async function startChangeStream() {
    const pipeline = [{ $match: { operationType: 'insert' } }];
    const stream = Visit.watch(pipeline);

    stream.on('change', async (change) => {
        try {
            const page = change.fullDocument.page;
            const count = await Visit.countDocuments({ page });
            broadcast('analytics:view', { page, totalViews: count });
        } catch (err) {
            console.error('Analytics change stream broadcast error:', err.message);
        }
    });

    stream.on('error', (err) => {
        console.error('Analytics change stream error:', err.message);
    });

    console.log('Analytics Change Stream watcher started');
}


module.exports = { router, startChangeStream, broadcast };
