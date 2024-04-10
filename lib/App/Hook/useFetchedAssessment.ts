import { Contract, Contractable } from '@/Domain/Entity';
import { AssessmentStatementRepository } from '@/Domain/Repository/AssesmentStatementRepository';
import { buildAssessment } from '@/Domain/Service/CreateNewAssessmentService/buildAssessment';
import { Assessment } from '@/Domain/ValueObject';
import { useState, useEffect, Dispatch, SetStateAction } from 'react';

export const useFetchedAssessment = (
    contract: Contract,
    contractable: Contractable,
): [
    Assessment | undefined,
    Dispatch<SetStateAction<Assessment | undefined>>,
] => {
    const [assessment, setAssessment] = useState<Assessment>();

    const fetchData = async () => {
        const assessmentStatements =
            await AssessmentStatementRepository.findByContract(contract.id);
        setAssessment(
            buildAssessment(assessmentStatements, contractable, contract),
        );
    };
    useEffect(() => {
        fetchData();
    }, [contract]);

    return [assessment, setAssessment];
};
