import { Assessment } from '@/Domain/ValueObject';
import { uniq } from 'lodash';
import { PartSummary } from './types';

export default function getPartSummariesFromAssessment(
    assessment: Assessment,
): PartSummary[] {
    const parts = uniq(assessment.statements.map(s => s.part));
    return parts.map(part => {
        const partStatements = assessment.statements.filter(
            a => a.part === part,
        );
        const subtotal = partStatements.reduce(
            (sum, statement) => (statement.price || 0) + sum,
            0,
        );
        const tax = subtotal * (assessment.contract.taxRate / 100);
        const total = subtotal + tax;
        return {
            part,
            subtotal,
            tax,
            total,
        };
    });
}
