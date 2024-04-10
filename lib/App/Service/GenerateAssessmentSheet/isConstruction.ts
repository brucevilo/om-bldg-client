import { Assessment } from '@/Domain/ValueObject';

export default function isConstruction(assessment: Assessment): boolean {
    if (assessment.contract.constructionId) return true;
    return false;
}
