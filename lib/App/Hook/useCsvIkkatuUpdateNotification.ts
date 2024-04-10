import { useState, useEffect } from 'react';
import {
    Retirement,
    UpdateCsvIkkatuUploadData,
    ConstructionStatement,
    Construction,
} from '@/Domain/Entity';
import {
    RetirementRepository,
    ConstructionStatementRepository,
    ConstructionRepository,
} from '@/Domain/Repository';

export const useCsvIkkatuUpdateNotidication = (
    data: UpdateCsvIkkatuUploadData,
): {
    retirement?: Retirement;
    construction?: Construction;
    constructionStatement?: ConstructionStatement;
} => {
    const [retirement, setRetirement] = useState<Retirement>();
    const [constructionStatement, setConstructionStatement] =
        useState<ConstructionStatement>();
    const [construction, setConstruction] = useState<Construction>();

    const fetchData = async () => {
        const fetchedRetirement = await RetirementRepository.get(
            data.retirementId,
        );
        if (fetchedRetirement.constructionStatementId) {
            setConstructionStatement(
                await ConstructionStatementRepository.get(
                    fetchedRetirement.constructionStatementId,
                ),
            );
        }
        setConstruction(
            await ConstructionRepository.get(fetchedRetirement.constructionId),
        );
        setRetirement(fetchedRetirement);
    };
    useEffect(() => {
        fetchData();
    }, []);

    return { construction, retirement, constructionStatement };
};
