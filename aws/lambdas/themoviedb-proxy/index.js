const https = require('https');
const querystring = require('querystring');

const TMDB_API_URL = 'https://api.themoviedb.org/3/';

exports.handler = async (event) => {
    try {
        const { path, parameters } = JSON.parse(event.body);
        const response = await requestTMDB(path, parameters);

        if (response.statusCode !== 200)
            throw new Error('Unexpected status code: ' + response.statusCode);

        return {
            ...response,
            headers: { 'Access-Control-Allow-Origin': process.env.CORS_ALLOW_ORIGIN },
        };
    } catch (error) {
        return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': process.env.CORS_ALLOW_ORIGIN },
            body: JSON.stringify('There was an error processing the request'),
        };
    }
};

function requestTMDB(path, parameters) {
    const url = TMDB_API_URL + path + '?' + querystring.stringify({
        ...parameters,
        api_key: process.env.TMDB_API_KEY,
    });

    return new Promise((resolve, reject) => {
        https
            .get(url, response => {
                const statusCode = response.statusCode;
                let body = '';

                response.on('data', chunk => body += chunk.toString());
                response.on('end', () => resolve({ statusCode, body }));
            })
            .on('error', error => reject(error));
    });
}
