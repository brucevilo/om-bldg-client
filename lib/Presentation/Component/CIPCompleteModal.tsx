import { AssetStatement } from '@/Domain/Entity';
import { CIPRepository } from '@/Domain/Repository';
import { DistributeDesignCostService } from '@/Domain/Service';
import { assertsIsExists, assertsIsNotNull } from '@/Infrastructure';
import { useRouter } from 'next/router';
import React, { FC, FormEventHandler, useContext, useState } from 'react';
import {
    Alert,
    Button,
    Form,
    Modal,
    ModalProps,
    Table,
    Spinner,
} from 'react-bootstrap';
import { CIPContext } from '../Context';
import { ManageSheetService } from '@/App/Service';
import { NumberInput } from './NumberInput';

export const CIPCompleteModal: FC<ModalProps> = props => {
    const context = useContext(CIPContext);
    const [isLoadingCIP, setIsLoadingCIP] = useState(false);

    if (!context) return null;
    const router = useRouter();
    const {
        construction,
        constructionStatements,
        assetStatements,
        selectedConstructionStatementIds,
        designs,
    } = context;
    const service = new DistributeDesignCostService(
        constructionStatements,
        assetStatements,
        designs,
    );
    const targetConstructionStatements = constructionStatements.filter(cs =>
        selectedConstructionStatementIds.includes(cs.id as number),
    );
    const [distributedAssetStatements, setDistributedAssetStatements] =
        useState<AssetStatement[]>(
            service
                .invoke()
                .filter(as =>
                    selectedConstructionStatementIds.includes(
                        as.constructionStatementId,
                    ),
                ),
        );
    const 設計委託費 = designs.reduce(
        (total, design) =>
            total + (design.latestContract.contractedPrice as number),
        0,
    );
    const 固定按分金額 = assetStatements.reduce(
        (total, as) => total + as.distributedDesignCost,
        0,
    );
    const 残按分金額 = 設計委託費 - 固定按分金額;
    const 今回按分金額 = distributedAssetStatements.reduce(
        (total, as) => total + (as.distributedDesignCost as number),
        0,
    );
    const onSubmit: FormEventHandler = async e => {
        e.preventDefault();
        setIsLoadingCIP(true);
        const isLast =
            selectedConstructionStatementIds.length ===
            constructionStatements.filter(
                cs => !cs.isConstructionInProgressCompleted,
            ).length;
        if (isLast && 残按分金額 !== 今回按分金額) {
            alert('残按分金額と今回按分金額が一致しません');
            return;
        }
        await CIPRepository.update(distributedAssetStatements);
        assertsIsExists(construction.id);
        await ManageSheetService.updateForCips(
            construction.id,
            distributedAssetStatements.map(as => {
                assertsIsNotNull(as.id);
                return as.id;
            }),
        );
        setIsLoadingCIP(false);
        router.push(
            '/constructions/[id]/summary',
            `/constructions/${construction.id}/summary`,
        );
    };
    const onChangeDistributedCost = (
        assetStatement: AssetStatement,
        cost: number,
    ) => {
        const newAssetStatements = distributedAssetStatements.map(as => {
            if (as.id !== assetStatement.id) return as;
            const newAssetStatement = as.copy();
            newAssetStatement.distributedDesignCost = cost;
            return newAssetStatement;
        });
        setDistributedAssetStatements(newAssetStatements);
    };
    const distributionTables = targetConstructionStatements.map(cs => {
        const targetAssetStatements = distributedAssetStatements.filter(
            as => as.constructionStatementId === cs.id,
        );
        const rows = targetAssetStatements.map(as => {
            assertsIsExists(as.distributedDesignCost);
            return (
                <tr key={as.id}>
                    <td title={as.name}>{as.name}</td>
                    <td>
                        {(
                            (as.assessmentPrice as number) +
                            as.distributedDesignCost
                        ).toLocaleString()}
                    </td>
                    <td>
                        <NumberInput
                            className='form-control'
                            value={as.distributedDesignCost.toString()}
                            onChange={value =>
                                onChangeDistributedCost(as, Number(value))
                            }
                        />
                    </td>
                </tr>
            );
        });
        return (
            <div key={cs.id}>
                <h6 className='mb-4'>{cs.name}</h6>
                <Table className='mb-5'>
                    <thead>
                        <tr>
                            <th>資産名称</th>
                            <th style={{ width: '160px' }}>建仮精算後金額　</th>
                            <th style={{ width: '160px' }}>按分金額</th>
                        </tr>
                    </thead>
                    <tbody>{rows}</tbody>
                </Table>
            </div>
        );
    });
    return (
        <Modal {...props} size='lg'>
            <Modal.Header closeButton>
                <Modal.Title>設計委託費按分</Modal.Title>
            </Modal.Header>
            <Modal.Body
                style={{ maxHeight: 600, overflow: 'auto' }}
                className='py-4'
            >
                <Alert variant='danger' className='mb-4'>
                    {construction.name}の按分金額が固定されます。
                    <br />
                    本当によろしいですか？
                </Alert>
                <div className='border rounded bg-white p-2 mb-4'>
                    <table className='w-100'>
                        <thead>
                            <tr>
                                <th>設計委託費</th>
                                <th>固定按分金額</th>
                                <th>残按分金額</th>
                                <th>今回按分金額</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{設計委託費.toLocaleString()}</td>
                                <td>{固定按分金額.toLocaleString()}</td>
                                <td>{残按分金額.toLocaleString()}</td>
                                <td>{今回按分金額.toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <Form onSubmit={onSubmit} id='cip-form'>
                    {distributionTables}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant='light'
                    className='bg-white border'
                    onClick={props.onHide}
                >
                    キャンセル
                </Button>
                {isLoadingCIP ? (
                    <Button
                        variant='light'
                        className='bg-white border'
                        disabled
                    >
                        <Spinner
                            as='span'
                            animation='grow'
                            size='sm'
                            role='status'
                            aria-hidden='true'
                        />
                        Loading...
                    </Button>
                ) : (
                    <Button
                        form='cip-form'
                        type='submit'
                        variant='light'
                        className='bg-white border'
                    >
                        確定して工事管理シートを更新する
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
};
