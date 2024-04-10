import {
    AssessmentStatement,
    AssetStatement,
    Contract,
    Contractable,
} from '@/Domain/Entity';
import { Assessment } from '@/Domain/ValueObject';

export const buildAssessment = (
    statements: AssessmentStatement[],
    contractable: Contractable,
    contract: Contract,
    assetStatements?: AssetStatement[],
): Assessment => {
    return new Assessment(
        contractable,
        contract,
        contract.constructionId ? '工事用' : '設計業務委託用',
        statements,
        assetStatements,
    );
};
