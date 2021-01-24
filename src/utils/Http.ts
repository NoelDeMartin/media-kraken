export interface SerializedResponse {
    status: number;
    statusText: string;
    headers: [string, string][];
    body: Blob;
}

class Http {

    public async serializeResponse(response: Response): Promise<SerializedResponse> {
        return {
            status: response.status,
            statusText: response.statusText,
            headers: [...response.headers.entries()],
            body: await response.blob(),
        };
    }

    public deserializeResponse(response: SerializedResponse): Response {
        const body = response.body.size === 0 ? null : response.body;

        return new Response(body, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
        });
    }

}

export default new Http();
