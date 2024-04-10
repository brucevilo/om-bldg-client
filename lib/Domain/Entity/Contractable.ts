import { Contract } from './Contract';

export abstract class Contractable {
    public name = '';
    public contracts: Contract[] = [];

    get prevContract(): Contract | null {
        if (this.contracts.length < 2) return null;
        return [...this.contracts].sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
        )[1];
    }

    get latestContract(): Contract {
        if (this.contracts.length === 0)
            throw new Error(
                `Contractが紐付けられていません\n${JSON.stringify(this)}`,
            );
        return [...this.contracts].sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
        )[0];
    }

    get firstContract(): Contract {
        if (this.contracts.length === 0)
            throw new Error(
                `Contractが紐付けられていません\n${JSON.stringify(this)}`,
            );
        return [...this.contracts].sort(
            (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
        )[0];
    }

    get isContractChanged(): boolean {
        if (!!this.prevContract) {
            return true;
        }
        return false;
    }
}
