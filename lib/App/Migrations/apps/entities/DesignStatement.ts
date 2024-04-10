import { ConstructionStatement } from './ConstructionStatement';
import { DesignStatementMaster } from '../CostDocument';

export class DesignStatement {
    public constructor(
        private _costDocument: File,
        private _designDocument: File | null,
        private _constructionName: string,
        private _designChangeNumber: number,
        private _constructionStatements: ConstructionStatement[],
    ) {}

    public get costDocument(): File {
        return this._costDocument;
    }
    public get designDocument(): File | null {
        return this._designDocument;
    }
    public get constructionName(): string {
        return this._constructionName;
    }
    public get designChangeNumber(): number {
        return this._designChangeNumber;
    }
    public get constructionStatements(): ConstructionStatement[] {
        return [...this._constructionStatements];
    }

    public get constructionStatementNames(): string[] {
        return this._constructionStatements.map(cs => cs.name);
    }

    public hasError(): boolean {
        return (
            this._constructionStatements.length > 0 &&
            this._constructionStatements.filter(cs => cs.hasError()).length > 0
        );
    }

    public hasInvalidCostItem(): boolean {
        return (
            this._constructionStatements.length > 0 &&
            this._constructionStatements.some(cs => cs.hasItemInvalid())
        );
    }

    public setDesignDocument(file: File | null): DesignStatement {
        const ret = this.clone();
        ret._designDocument = file;
        return ret;
    }

    public setConstructionStatements(
        newItems: ConstructionStatement[],
    ): DesignStatement {
        const ret = this.clone();
        ret._constructionStatements = newItems;
        return ret;
    }

    public updateConstructionStatement(
        newItem: ConstructionStatement,
    ): DesignStatement {
        const ret = this.clone();
        ret._constructionStatements = ret._constructionStatements.map(cs => {
            if (cs.name === newItem.name) {
                return newItem;
            }
            return cs;
        });
        return ret;
    }

    public clone(): DesignStatement {
        return new DesignStatement(
            this.costDocument,
            this.designDocument,
            this.constructionName,
            this.designChangeNumber,
            this.constructionStatements,
        );
    }

    public static createFromMaster(
        master: DesignStatementMaster,
    ): DesignStatement {
        return new DesignStatement(
            master.costDocument,
            null,
            master.constructionName,
            master.designChangeNumber,
            master.constructionStatements.map(cs =>
                ConstructionStatement.createFromMaster(cs),
            ),
        );
    }
}
