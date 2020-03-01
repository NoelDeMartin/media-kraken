const https = require('https');
const querystring = require('querystring');

const TMDB_API_URL = 'https://api.themoviedb.org/3/';
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': process.env.CORS_ALLOW_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type',
};

exports.handler = async (event) => {
    try {
        const { path, parameters } = JSON.parse(event.body);
        const response = await requestTMDB(path, parameters);

        if (response.statusCode !== 200) {
            let errorMessage;

            try {
                const { status_message } = JSON.parse(response.body);

                errorMessage = status_message;
            } catch (error) {
                errorMessage = 'Unexpected status code: ' + response.statusCode;
            }

            throw new Error(errorMessage);
        }

        return {
            ...response,
            headers: CORS_HEADERS,
        };
    } catch (error) {
        console.error(error);

        return {
            statusCode: 400,
            headers: CORS_HEADERS,
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
                let body = '';

                response.on('data', chunk => body += chunk.toString());
                response.on('end', () => resolve({ statusCode: response.statusCode, body }));
            })
            .on('error', error => reject(error));
    });
}
