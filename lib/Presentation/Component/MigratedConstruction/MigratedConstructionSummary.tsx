import {
    ActionHistory,
    Construction,
    ConstructionStatement,
    Contract,
    Supplier,
    User,
} from '@/Domain/Entity';
import { ActionHistoryList } from '@/Presentation/Component';
import { DateTime } from 'luxon';
import React, { FC } from 'react';
import { Col, Row, Table, Card, Button } from 'react-bootstrap';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { faFile } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';

interface Props {
    construction: Construction;
    statements: ConstructionStatement[];
    firstContract: Contract;
    lastContractedPrice: number;
    suppliers: Supplier[];
    users: User[];
    actionHistories: ActionHistory[];
}

export const MigratedConstructionSummary: FC<Props> = props => {
    const router = useRouter();
    const { construction, firstContract, users, suppliers, actionHistories } =
        props;

    return (
        <>
            <Row className='mb-5'>
                <Col>
                    <h5 className='font-weight-bold mb-4'>ヒストリー</h5>
                    <Card>
                        <Card.Body>
                            <ActionHistoryList
                                actionHistories={actionHistories}
                            />
                        </Card.Body>
                    </Card>
                </Col>
                <Col>
                    <h5 className='font-weight-bold mb-4'>基本情報</h5>
                    <Card>
                        <Card.Body>
                            <Table hover>
                                <tbody>
                                    <tr>
                                        <th className='w-25 border-0'>
                                            稟議番号
                                        </th>
                                        <td className='border-0'>
                                            {firstContract.approvalNumber ||
                                                '---'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th className='border-0'>設計書番号</th>
                                        <td className='border-0'>
                                            <div className='d-flex justify-content-between align-items-center'>
                                                {
                                                    construction.documentNumber
                                                        .dividedHyphen
                                                }
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th className='border-0'>
                                            設計担当係長
                                        </th>
                                        <td className='border-0'>
                                            <div className='d-flex justify-content-between align-items-center'>
                                                {users.find(
                                                    u =>
                                                        u.id ===
                                                        firstContract.designChiefId,
                                                )?.name || '---'}
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th className='border-0'>設計担当者</th>
                                        <td className='border-0'>
                                            <div className='d-flex justify-content-between align-items-center'>
                                                {users.find(
                                                    u =>
                                                        u.id ===
                                                        firstContract.designStaffId,
                                                )?.name || '---'}
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th className='border-0'>
                                            工事担当係長
                                        </th>
                                        <td className='border-0'>
                                            <div className='d-flex justify-content-between align-items-center'>
                                                {users.find(
                                                    u =>
                                                        u.id ===
                                                        firstContract.constructionChiefId,
                                                )?.name || '---'}
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th className='border-0'>工事担当者</th>
                                        <td className='border-0'>
                                            <div className='d-flex justify-content-between align-items-center'>
                                                {users.find(
                                                    u =>
                                                        u.id ===
                                                        firstContract.constructionStaffId,
                                                )?.name || '---'}
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th className='border-0'>受注者</th>
                                        <td className='border-0'>
                                            {suppliers.find(
                                                s =>
                                                    s.id ===
                                                    firstContract.supplierId,
                                            )?.name || '---'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th className='border-0'>
                                            当初予定価格（税抜）
                                        </th>
                                        <td className='border-0'>
                                            {firstContract.isDisplayDistributedPrice
                                                ? firstContract.expectedPrice?.toLocaleString()
                                                : '---'}
                                            円
                                        </td>
                                    </tr>
                                    <tr>
                                        <th className='border-0'>
                                            当初契約金額（税抜）
                                        </th>
                                        <td className='border-0'>
                                            {firstContract.contractedPrice?.toLocaleString() ||
                                                '---'}
                                            円
                                        </td>
                                    </tr>
                                    <tr>
                                        <th className='border-0'>
                                            最終契約金額（税抜）
                                        </th>
                                        <td className='border-0'>
                                            {props.lastContractedPrice.toLocaleString() ||
                                                '---'}
                                            円
                                        </td>
                                    </tr>
                                    <tr>
                                        <th className='border-0'>落札率</th>
                                        <td className='border-0'>
                                            {firstContract.rate
                                                ? Math.floor(
                                                      firstContract.rate *
                                                          10000,
                                                  ) / 10000
                                                : '---'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th className='border-0'>契約日</th>
                                        <td className='border-0'>
                                            {firstContract.contractAt
                                                ? DateTime.fromJSDate(
                                                      firstContract.contractAt,
                                                  ).toFormat('yyyy年MM月dd日')
                                                : '---'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th className='border-0'>工事工期</th>
                                        <td className='border-0'>
                                            {firstContract.endAt
                                                ? DateTime.fromJSDate(
                                                      firstContract.endAt,
                                                  ).toFormat('yyyy年MM月dd日')
                                                : '---'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th className='border-0'>
                                            工事管理シート
                                        </th>
                                        <td className='border-0'>
                                            {firstContract.manageSheetInfo
                                                ?.filename ? (
                                                <Button
                                                    as={'a'}
                                                    href={
                                                        process.env
                                                            .NEXT_PUBLIC_API_ORIGIN +
                                                        firstContract
                                                            ?.manageSheetInfo
                                                            .path
                                                    }
                                                    variant='light'
                                                    className='bg-white border mr-3'
                                                >
                                                    <FA
                                                        icon={faFile}
                                                        className='mr-2'
                                                    />

                                                    {
                                                        firstContract
                                                            .manageSheetInfo
                                                            .filename
                                                    }
                                                </Button>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                            <div className='text-right'>
                                <Button
                                    variant='outline-dark'
                                    onClick={() =>
                                        router.push(
                                            `/migrations/constructions/${construction.id}/edit`,
                                        )
                                    }
                                >
                                    編集
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <h5 className='font-weight-bold mb-4'>工事ステータス</h5>
            <Card className='p-3 text-center'>
                移行ツール経由で作成されたため、表示する情報はありません
            </Card>
        </>
    );
};
