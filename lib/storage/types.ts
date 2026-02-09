export interface StorageProvider {
    /**
     * Upload a file to storage
     * @param path The path where the file should be stored
     * @param file The file content (Buffer, Blob, or base64 string)
     * @param contentType The MIME type of the file
     */
    upload(path: string, file: Buffer | Blob | string, contentType: string): Promise<string>;

    /**
     * Generate a signed URL for a file
     * @param path The path to the file
     * @param expiresIn Expiry time in seconds (default 48 hours)
     */
    getSignedUrl(path: string, expiresIn?: number): Promise<string>;
}
