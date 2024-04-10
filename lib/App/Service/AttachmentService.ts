export class AttachmentService {
    public static async convertBlobToBase64(blob: Blob): Promise<string> {
        const reader = new FileReader();
        return await new Promise(resolve => {
            reader.onloadend = () => {
                if (typeof reader.result !== 'string')
                    throw new Error('unexpected result type');
                const dataUrl = reader.result;
                const splitted = dataUrl.split(',');
                const base64 = splitted[1];
                if (!base64) throw new Error('invalid dataurl format');
                resolve(base64);
            };
            reader.readAsDataURL(blob);
        });
    }
    public static async convertBlobToDataUrl(blob: Blob): Promise<string> {
        const reader = new FileReader();
        return await new Promise(resolve => {
            reader.onloadend = () => {
                if (typeof reader.result !== 'string')
                    throw new Error('unexpected result type');
                const dataUrl = reader.result;
                resolve(dataUrl);
            };
            reader.readAsDataURL(blob);
        });
    }
}
