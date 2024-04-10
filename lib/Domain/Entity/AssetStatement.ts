import { Entity, Timestamps, AssetClass } from '.';

export class AssetStatement implements Entity, Timestamps {
    constructor(
        public id: number | null,
        public constructionStatementId: number,
        public assetClass: AssetClass | null,
        public name: string,
        public distributedPrice: number,
        public sapKey: string,
        public sapRecordedAt: Date | null,
        public sapRecordedPrice: number | null,
        public isPrivatized: boolean,
        public sapFixedAssetId: number | null,
        public constructionTypeSerialNumber: number | null,
        public distributedDesignCost: number,
        public assessmentPrice: number | null,
        public createdAt: Date,
        public updatedAt: Date,
        public buildingsId: number | null,
    ) {}

    copy(): AssetStatement {
        return new AssetStatement(
            this.id,
            this.constructionStatementId,
            this.assetClass,
            this.name,
            this.distributedPrice,
            this.sapKey,
            this.sapRecordedAt,
            this.sapRecordedPrice,
            this.isPrivatized,
            this.sapFixedAssetId,
            this.constructionTypeSerialNumber,
            this.distributedDesignCost,
            this.assessmentPrice,
            this.createdAt,
            this.updatedAt,
            this.buildingsId,
        );
    }

    get isCost(): boolean {
        return !this.assetClass?.id;
    }
}
