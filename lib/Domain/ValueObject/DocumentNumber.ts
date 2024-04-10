export class DocumentNumber {
    constructor(public value: string) {}

    private dividedPoint = 4;
    private endPoint = 8;

    get dividedHyphen(): string {
        if (this.value === '') {
            return this.value;
        }
        return (
            this.value.slice(0, this.dividedPoint) +
            '-' +
            this.value.slice(this.dividedPoint, this.endPoint)
        );
    }

    get serialNumber(): string {
        return this.value.slice(this.dividedPoint);
    }
}
