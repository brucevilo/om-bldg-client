import { Assessment } from '@/Domain/ValueObject';

export default function isChanged(assessment: Assessment): boolean {
    return assessment.contract.id !== assessment.contractable.firstContract.id;
}
