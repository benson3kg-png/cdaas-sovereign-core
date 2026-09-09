/**
 * ============================================================================
 *         AVENUE B: COGNITIVE DE-ESCALATION INTERACTIVE CLIENT TERMINAL
 * ============================================================================
 * ARCHITECTURE : Event-Driven Readline Ingress / Egress Controller
 * PIPELINE     : Native Node.js HTTP Streaming Client (Zero Abstraction Overhead)
 * LOGIC MATRIX : Sequential Human Language Compression Framework
 * TARGET PORT  : Port 4000 (Local Connection Ingress Server)
 * ============================================================================
 */

const http = require('http');
const readline = require('readline');

const CLIENT_CONFIG = {
    SERVER_HOST: 'localhost',
    SERVER_PORT: 4000,
    SERVER_PATH: '/api/v1/cdaas/deescalate',
    USER_IDENTITY: '233241112222' 
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function transmitToCompactorCore(rawSensation) {
    const payloadBuffer = JSON.stringify({
        user_id: CLIENT_CONFIG.USER_IDENTITY,
        sensation_input: rawSensation
    });

    const outboundRequest = http.request({
        hostname: CLIENT_CONFIG.SERVER_HOST,
        port: CLIENT_CONFIG.SERVER_PORT,
        path: CLIENT_CONFIG.SERVER_PATH,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payloadBuffer)
        }
    }, (response) => {
        let serverFeedbackStream = '';
        response.on('data', chunk => { serverFeedbackStream += chunk; });
        response.on('end', () => {
            try {
                const parseResponse = JSON.parse(serverFeedbackStream);
                
                process.stdout.write("\n============================================================\n");
                process.stdout.write("🛡️  [COMPACTION MATRIX CONFIRMATION]\n");
                process.stdout.write("============================================================\n");
                process.stdout.write(`STATUS       : ${parseResponse.status}\n`);
                process.stdout.write("============================================================\n");
                process.stdout.write("⚡ Root folder flattened to microwatts. System equilibrium restored.\n\n");
                
                initializeCognitiveIngressLoop();
            } catch (err) {
                process.stderr.write("❌ [ENCLAVE SYNTAX EXCEPTION]: Failed to parse backend feedback.\n");
                initializeCognitiveIngressLoop();
            }
        });
    });

    outboundRequest.on('error', (netErr) => {
        process.stderr.write(`❌ [PERIMETER DISRUPTION]: Line disconnected: ${netErr.message}\n`);
        initializeCognitiveIngressLoop();
    });

    outboundRequest.write(payloadBuffer);
    outboundRequest.end();
}

function initializeCognitiveIngressLoop() {
    process.stdout.write("------------------------------------------------------------\n");
    process.stdout.write("👁️  OMNIMESH CDaaS: INPUT ACTIVE CRAVING OR STRESS VECTOR LOG\n");
    process.stdout.write("------------------------------------------------------------\n");
    
    rl.question("👉 Describe the raw feeling (or type 'EXIT' to drop ports): ", (userInput) => {
        const cleanInput = userInput.trim();

        if (cleanInput.toUpperCase() === 'EXIT') {
            process.stdout.write("⚡ Severing client terminal connection strings. Ingress gates closed.\n");
            rl.close();
            process.exit(0);
        }

        if (!cleanInput) {
            process.stdout.write("⚠️  [INGRESS REFUSAL]: Payload context missing. Re-input variable.\n\n");
            return initializeCognitiveIngressLoop();
        }

        process.stdout.write("\n🔄 [PROCESSING]: Executing Variable Compactor Logic...\n");
        process.stdout.write("🔄 [PROCESSING]: Stripping behavioral sub-folders and presentation noise...\n");
        
        transmitToCompactorCore(cleanInput);
    });
}

process.stdout.write("\n============================================================\n");
process.stdout.write("🧠 COGNITIVE DE-ESCALATION AS A SERVICE: RUNTIME NODE INITIALIZED\n");
process.stdout.write("============================================================\n");
initializeCognitiveIngressLoop();
