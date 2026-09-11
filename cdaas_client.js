const http = require('http');
const readline = require('readline');

const CONFIG = {
    HOST: 'localhost',
    PORT: 4000,
    PATH: '/api/v1/cdaas/deescalate',
    ID: '233241112222'
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function send(inputData) {
    const payload = JSON.stringify({
        user_id: CONFIG.ID,
        sensation_input: inputData
    });

    const req = http.request({
        hostname: CONFIG.HOST,
        port: CONFIG.PORT,
        path: CONFIG.PATH,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
        }
    }, (res) => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => {
            try {
                const out = JSON.parse(body);
                process.stdout.write(`\n--- RESULT ---\nStatus: ${out.status}\n--------------\n\n`);
                loop();
            } catch (err) {
                process.stderr.write(`[ERR] Parse error: ${err.message}\n`);
                loop();
            }
        });
    });

    req.on('error', (err) => {
        process.stderr.write(`[CONN] Network failure: ${err.message}\n`);
        loop();
    });

    req.write(payload);
    req.end();
}

function loop() {
    rl.question("Input: ", (userInput) => {
        const cmd = userInput.trim();

        if (cmd.toUpperCase() === 'EXIT') {
            rl.close();
            process.exit(0);
        }

        if (!cmd) {
            process.stdout.write(`[WARN] Empty input\n\n`);
            return loop();
        }

        send(cmd);
    });
}

process.stdout.write("Terminal Client Online\n");
loop();
