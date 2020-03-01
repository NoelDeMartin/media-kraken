const args = require('yargs')
    .options({
        'api-key': {
            describe: 'TMDB Api Key',
            demandOption: true,
        },
        'port': {
            describe: 'Server port',
            type: 'number',
            default: 8001,
        },
    })
    .help()
    .argv;

process.env.CORS_ALLOW_ORIGIN = '*';
process.env.TMDB_API_KEY = args['api-key'];

const port = args['port'];

const { handler: callProxy } = require('./index');
const http = require('http');
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
};

const server = http.createServer((request, response) => {
    if (request.method === 'OPTIONS') {
        response.writeHead(200, CORS_HEADERS);
        response.end();

        return;
    }

    let body = '';

    request.on('data', chunk => body += chunk.toString());
    request.on('end', async () => {
        try {
            const proxyResponse = await callProxy({ body });

            response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
            response.end(proxyResponse.body);
        } catch (error) {
            response.writeHead(500, CORS_HEADERS);
            response.end(JSON.stringify('Proxy error: ' + error.message || 'Unknown'));
        }
    });
});

server.listen(port);

console.log(`Server running at http://localhost:${port}`);
