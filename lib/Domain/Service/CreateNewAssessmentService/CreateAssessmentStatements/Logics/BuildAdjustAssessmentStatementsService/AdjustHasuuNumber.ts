export class AdjustHasuuNumber {
    private adjustHasuuNumbers = [3, 4, 2];
    private latestAdjustHasuuIndex = -1;

    public nextAdjustHasuuNumber = (): number => {
        this.latestAdjustHasuuIndex += 1;
        return this.adjustHasuuNumbers[this.latestAdjustHasuuIndex];
    };
    public get isFinalAdjustHasuuNumber(): boolean {
        return this.adjustHasuuNumbers.length === this.latestAdjustHasuuIndex;
    }
}
