import { SapRecord, SapRecordMap } from '../SapDocument';

export class MigrationConstruction {
    public constructor(
        private _year: number,
        private _name: string,
        private _recordKeys: string[],
    ) {}

    public get year(): number {
        return this._year;
    }
    public get name(): string {
        return this._name;
    }
    public get recordKeys(): string[] {
        return [...this._recordKeys];
    }

    public get id(): string {
        return `${this._year}_${this._name}`;
    }
    public get date(): Date {
        return new Date(String(this._year));
    }

    public setYear(year: number): MigrationConstruction {
        const ret = this.clone();
        ret._year = year;
        return ret;
    }

    public setName(name: string): MigrationConstruction {
        const ret = this.clone();
        ret._name = name;
        return ret;
    }

    public addRecordKey(...keys: string[]): MigrationConstruction {
        const ret = this.clone();
        ret._recordKeys = Array.from(new Set(ret._recordKeys.concat(keys)));
        return ret;
    }

    public removeRecordKey(...keys: string[]): MigrationConstruction {
        const ret = this.clone();
        ret._recordKeys = ret._recordKeys.filter(v => !keys.includes(v));
        return ret;
    }

    public clone(): MigrationConstruction {
        return new MigrationConstruction(this.year, this.name, this.recordKeys);
    }

    public static create(
        params?: MigrationConstruction,
    ): MigrationConstruction {
        return new MigrationConstruction(
            params ? params._year : 0,
            params ? params._name : '',
            params ? params._recordKeys : [],
        );
    }

    public static createFromSapRecord(
        record: SapRecord,
    ): MigrationConstruction {
        return new MigrationConstruction(
            record.constructionYear,
            record.constructionName,
            [record.assetKey],
        );
    }

    public static createFromSapRecordMap(
        records: SapRecordMap,
    ): MigrationConstruction[] {
        const constructions: {
            [key: string]: MigrationConstruction;
        } = {};
        Object.values(records).forEach(record => {
            const construction =
                MigrationConstruction.createFromSapRecord(record);
            if (constructions[construction.id]) {
                constructions[construction.id] = constructions[
                    construction.id
                ].addRecordKey(record.assetKey);
                return;
            }
            constructions[construction.id] = construction;
        });
        return Object.values(constructions);
    }
}
