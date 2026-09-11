const http = require('http');
const crypto = require('crypto');

const CONFIG = {
    PORT: 4000,
    PATH: "/api/v1/cdaas/deescalate",
    TTL_MS: 1800000 
};

const cache = new Map();

function pack(nodeId) {
    return Buffer.from(JSON.stringify({
        hash: crypto.randomBytes(8).toString('hex'),
        sub: nodeId,
        status: "LOCKED",
        ts: Date.now()
    })).toString('base64');
}

const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const u = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === 'POST' && u.pathname === CONFIG.PATH) {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const payload = JSON.parse(body);
                const client = payload?.user_id;
                const input = payload?.sensation_input?.trim();

                if (!client || !input) {
                    res.writeHead(400);
                    return res.end(JSON.stringify({ error: "BAD_FRAME" }));
                }

                cache.set(client, {
                    status: "OK",
                    seal: pack(client)
                });

                res.writeHead(200);
                res.end(JSON.stringify({ status: "PROCESSED" }));
                body = null;
            } catch (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: "ERR_CORE" }));
            }
        });
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: "NOT_FOUND" }));
    }
});

setInterval(() => { cache.clear(); }, CONFIG.TTL_MS);

server.listen(CONFIG.PORT, '::');
