import React, { FC, useState } from 'react';
import {
    ConstructionStatement,
    AssetStatement,
    Construction,
} from '@/Domain/Entity';
import { CIPRepository } from '@/Domain/Repository';
import { assertsIsExists } from '@/Infrastructure';
import {
    Badge,
    Table,
    Button,
    Accordion,
    Card,
    Container,
    Row,
    Col,
} from 'react-bootstrap';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import { UploadSapRecordFromImportedManageSheetButtonWithModal } from '@/Presentation/Component';

interface Props {
    construction: Construction;
    assetStatements: AssetStatement[];
    constructionStatements: ConstructionStatement[];
}

export const ConstructionInProgressResult: FC<Props> = ({
    construction,
    assetStatements,
    constructionStatements,
}) => {
    const resetCip = async () => {
        if (!confirm('本当に建設仮勘定を最初からやり直しますか？')) return;
        assertsIsExists(construction.id, '工事にIDが紐づいていません');
        await CIPRepository.reset(construction.id);
        alert('建設仮勘定をリセットしました');
        location.reload();
    };

    const tables = constructionStatements.map(cs => {
        const [show, setShow] = useState(true);
        const targetAssetStatements = assetStatements.filter(
            as => as.constructionStatementId === cs.id,
        );
        const rows = targetAssetStatements.map(as => (
            <tr key={as.id}>
                <td>{as.name}</td>
                <td style={{ textAlign: 'right' }}>
                    {(
                        (as.assessmentPrice as number) +
                        as.distributedDesignCost
                    ).toLocaleString()}
                </td>
                <td style={{ paddingLeft: '80px' }}>{as.assetClass?.code}</td>
                <td>{as.assetClass?.name}</td>
            </tr>
        ));
        const StatusBadge = () => {
            if (
                cs.isConstructionInProgressCompleted &&
                targetAssetStatements.every(as => as.sapRecordedAt)
            ) {
                return (
                    <Badge variant='info' className='mr-2'>
                        建仮精算アップロード済み
                    </Badge>
                );
            } else if (cs.isConstructionInProgressCompleted) {
                return (
                    <Badge variant='info' className='mr-2'>
                        建仮精算済み
                    </Badge>
                );
            } else {
                return (
                    <Badge variant='secondary' className='mr-2'>
                        未精算
                    </Badge>
                );
            }
        };
        return (
            <Accordion key={cs.id} className='mb-4'>
                {show ? (
                    <Accordion.Toggle
                        as={Card.Header}
                        className='bg-white'
                        eventKey='0'
                        onClick={() => setShow(false)}
                    >
                        <div className='d-flex justify-content-between align-items-center'>
                            <div>
                                <StatusBadge />
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
                                {cs.isConstructionInProgressCompleted ? (
                                    <Badge variant='info' className='mr-2'>
                                        建仮精算済み
                                    </Badge>
                                ) : (
                                    <Badge variant='secondary' className='mr-2'>
                                        未精算
                                    </Badge>
                                )}
                                {cs.name}
                            </div>
                            <FA icon={faAngleUp} className='text-info' />
                        </div>
                    </Accordion.Toggle>
                )}
                <Accordion.Collapse className='overflow-auto' eventKey='0'>
                    <Table>
                        <thead>
                            <tr>
                                <th style={{ width: '400px' }}>資産名称</th>
                                <th
                                    style={{
                                        width: '160px',
                                        textAlign: 'right',
                                    }}
                                >
                                    金額
                                </th>
                                <th
                                    style={{
                                        width: '250px',
                                        paddingLeft: '80px',
                                    }}
                                >
                                    資産クラスコード
                                </th>
                                <th>資産クラス名称</th>
                            </tr>
                        </thead>
                        <tbody>{rows}</tbody>
                    </Table>
                </Accordion.Collapse>
            </Accordion>
        );
    });

    return (
        <div>
            {constructionStatements.length >= 0 &&
                construction.latestContract.id ===
                    constructionStatements[0].contractId && (
                    <Container fluid className='mb-4'>
                        <Row>
                            <Col sm='3' className='font-weight-bold border p-3'>
                                工事管理シート
                            </Col>
                            <Col sm='6' className='p-3 bg-white'>
                                {construction.latestContract
                                    .sapRecordImportManageSheetInfo && (
                                    <p>
                                        {
                                            construction.latestContract
                                                .sapRecordImportManageSheetInfo
                                                .filename
                                        }
                                    </p>
                                )}
                            </Col>
                            <Col
                                sm='3'
                                className='p-3 bg-white d-flex align-items-center justify-content-end'
                            >
                                <UploadSapRecordFromImportedManageSheetButtonWithModal
                                    assetStatements={assetStatements}
                                    constructionId={construction.id as number}
                                    onSubmit={() => location.reload()}
                                />
                            </Col>
                        </Row>
                    </Container>
                )}
            <div>{tables}</div>
            <div className='text-right'>
                <Button
                    onClick={() => resetCip()}
                    variant='light'
                    className='bg-white border'
                >
                    建設仮勘定をやり直す
                </Button>
            </div>
        </div>
    );
};
