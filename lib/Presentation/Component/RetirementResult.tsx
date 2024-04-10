import React, { useEffect, useState, FC } from 'react';
import { useRouter } from 'next/router';
import { ConstructionStatement, Construction } from '@/Domain/Entity';
import {
    ConstructionStatementRepository,
    RetirementRepository,
} from '@/Domain/Repository';
import { Badge, Button, Accordion, Card } from 'react-bootstrap';
import { groupBy } from 'lodash';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import { RetirementResultCard } from '@/Presentation/Component';
import { assertsIsExists, assertsIsNotNull } from '@/Infrastructure';

interface Props {
    construction: Construction;
}

export const RetirementResult: FC<Props> = ({ construction }) => {
    const [constructionStatements, setConstructionStatements] = useState<
        ConstructionStatement[]
    >([]);

    const router = useRouter();

    const fetchData = async () => {
        assertsIsNotNull(construction.id, '工事にIDがありません');
        const fetchedConstructionStatements =
            await ConstructionStatementRepository.listByConstruction(
                construction.id,
                construction.latestContract.id,
            );
        setConstructionStatements(fetchedConstructionStatements);
    };

    const resetRetirementByConstructionStatement = async (
        cs: ConstructionStatement,
    ) => {
        if (!confirm(`${cs.name}の除却を最初からやり直しますか？`)) return;
        assertsIsExists(cs.id, '工事明細にIDが紐づいていません');
        await RetirementRepository.resetByConstructionStatement(cs.id);
        alert('除却をリセットしました');
        router.push(
            `/constructions/${construction.id}/retirement/select_cost_items?constructionStatementId=${cs.id}`,
        );
    };

    const RetirementResultDetails = (props: {
        constructionStatement: ConstructionStatement;
    }) => {
        const { constructionStatement } = props;
        if (!constructionStatement.isRetiremented)
            return (
                <div className='text-right'>
                    {construction.latestContract.isProcessing ? (
                        <Button
                            variant='light border'
                            className='bg-white my-4'
                            onClick={() => alert('工事管理シート編集中です')}
                        >
                            除却する
                        </Button>
                    ) : (
                        <Button
                            href={`/constructions/${construction.id}/retirement/select_cost_items?constructionStatementId=${constructionStatement.id}`}
                            as='a'
                            variant='light border'
                            className='bg-white my-4'
                        >
                            除却する
                        </Button>
                    )}
                </div>
            );
        assertsIsNotNull(
            constructionStatement.retirement,
            '除却済みの工事明細にRetirementが紐づいていません',
        );

        return (
            <div className='my-2'>
                {constructionStatement.retirement &&
                    (constructionStatement.retirement.retirementCostItems
                        .length === 0 ? (
                        <span className='mr-4'>
                            本工事には除却対象がありませんでした
                        </span>
                    ) : (
                        Object.values(
                            groupBy(
                                constructionStatement.retirement
                                    .retirementCostItems,
                                r => r.assetStatement.id,
                            ),
                        ).map(retirementCostItemsGroupByAssetStatement => (
                            <RetirementResultCard
                                key={
                                    retirementCostItemsGroupByAssetStatement[0]
                                        .id
                                }
                                construction={construction}
                                retirementCostItemsGroupByAssetStatement={
                                    retirementCostItemsGroupByAssetStatement
                                }
                            />
                        ))
                    ))}
                <Button
                    variant='light'
                    className='bg-white border'
                    onClick={() =>
                        resetRetirementByConstructionStatement(
                            constructionStatement,
                        )
                    }
                >
                    除却をやり直す
                </Button>
            </div>
        );
    };

    useEffect(() => {
        fetchData();
    }, []);
    const [show, setShow] = useState(true);
    return (
        <div>
            {constructionStatements.map(cs => (
                <Accordion key={`cs-id-${cs.id}`} className='mb-4'>
                    {show ? (
                        <Accordion.Toggle
                            as={Card.Header}
                            className='bg-white'
                            eventKey='0'
                            onClick={() => setShow(false)}
                        >
                            <div className='d-flex justify-content-between align-items-center'>
                                <div>
                                    {cs.isRetiremented ? (
                                        <Badge
                                            className='mr-2'
                                            variant='secondary'
                                        >
                                            除却済み
                                        </Badge>
                                    ) : (
                                        <Badge
                                            className='mr-2'
                                            variant='danger'
                                        >
                                            未除却
                                        </Badge>
                                    )}
                                    {cs.name}
                                </div>
                                <FA icon={faAngleDown} className='text-info' />
                            </div>
                        </Accordion.Toggle>
                    ) : (
                        <Accordion.Toggle
                            as={Card.Header}
                            className='bg-white'
                            eventKey='0'
                            onClick={() => setShow(true)}
                        >
                            <div className='d-flex justify-content-between align-items-center'>
                                <div>
                                    {cs.isRetiremented ? (
                                        <Badge
                                            className='mr-2'
                                            variant='secondary'
                                        >
                                            除却済み
                                        </Badge>
                                    ) : (
                                        <Badge
                                            className='mr-2'
                                            variant='danger'
                                        >
                                            未除却
                                        </Badge>
                                    )}
                                    {cs.name}
                                </div>
                                <FA icon={faAngleUp} className='text-info' />
                            </div>
                        </Accordion.Toggle>
                    )}
                    <Accordion.Collapse as={Card.Body} eventKey='0'>
                        <RetirementResultDetails constructionStatement={cs} />
                    </Accordion.Collapse>
                </Accordion>
            ))}
        </div>
    );
};
