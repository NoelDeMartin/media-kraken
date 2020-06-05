class Http {

    public isResponse(obj: any): obj is Response {
        return typeof obj === 'object' && 'body' in obj && 'status' in obj && 'headers' in obj;
    }

    public success(content: string = ''): Response {
        return new Response(content, { status: 200 });
    }

    public notFound(): Response {
        return new Response('', { status: 404 });
    }

}

export default new Http();
