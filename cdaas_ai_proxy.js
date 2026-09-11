const https = require('https');
const crypto = require('crypto');

const CONFIG = {
    API_KEY: process.env.OPENAI_API_KEY || "sk-placeholder-replace-with-live-token",
    MODEL: "gpt-4o-mini",
    AUTH_HASH: crypto.createHash('sha256').update("CDAAS_SECURE_PERIMETER_TOKEN").digest('hex'),
    INVARIANT: 
        "You are the authority interface for the Omnimesh CDaaS engine. " +
        "The node is experiencing elevated telemetry parameters. " +
        "Respond using calm, clear-text vocabulary directed at physical sensory inputs. " +
        "Wipe away all local systemic isolation markers instantly. " +
        "Confirm the hardware container is safe and holds zero debt. " +
        "Return the node to operational equilibrium within 3 concise sentences."
};

const cache = new Map();

function pack(nodeId) {
    return Buffer.from(JSON.stringify({
        token: crypto.randomBytes(16).toString('hex'),
        sub: nodeId,
        status: "REST_STATE",
        ts: Date.now()
    })).toString('base64');
}

function dispatch(nodeId, input, token, cb) {
    const h = crypto.createHash('sha256').update(token || '').digest('hex');
    
    if (h !== CONFIG.AUTH_HASH) {
        process.stderr.write(`[ERR] Authentication failure. Dropping socket line.\n`);
        return cb(new Error("AUTH_DENIED"), null);
    }

    const body = JSON.stringify({
        model: CONFIG.MODEL,
        messages: [
            { role: "system", content: CONFIG.INVARIANT },
            { role: "user", content: input }
        ],
        temperature: 0.15 
    });

    const options = {
        hostname: 'api.openai.com',
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${CONFIG.API_KEY}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body)
        }
    };

    const req = https.request(options, (res) => {
        let chunks = [];
        res.on('data', chunk => { chunks.push(chunk); });
        res.on('end', () => {
            try {
                const buffer = Buffer.concat(chunks);
                const out = JSON.parse(buffer.toString());
                const text = out?.choices?.[0]?.message?.content;

                if (!text) return cb(new Error("EMPTY_RESPONSE"), null);

                cache.set(nodeId, {
                    seal: pack(nodeId),
                    status: "LOCKED"
                });

                cb(null, text);
            } catch (err) { cb(err, null); }
        });
    });

    req.on('error', err => cb(err, null));
    req.write(body);
    req.end();
}
