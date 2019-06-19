export interface IRequestResponse {
    status: number;
    data: any;
    message?: string;
    error?: {
        type: string;
        message: string;
        parameters: string;
    };
}
