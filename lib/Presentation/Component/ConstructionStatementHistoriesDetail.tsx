import React, { FC, useState } from 'react';
import { ConstructionStatementHistory } from '@/Domain/Entity';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import {
    faAngleDown,
    faAngleUp,
    faFile,
} from '@fortawesome/free-solid-svg-icons';
import { Card, Table } from 'react-bootstrap';
import { DateTime } from 'luxon';
import { useRouter } from 'next/router';
import { AttachmentInfo } from '@/Domain/ValueObject';
import { calculateTotalScheduledChange } from '@/App/Service';

interface Props {
    csHistories: ConstructionStatementHistory[] | null;
}

const leftLabelStyle = { minWidth: '100px', width: '20%' };
const rightLabelStyle = { minWidth: '144px', width: '30%' };
const bottomLabelStyle = { minWidth: '102px', width: '10%' };

const renderRow = (
    leftLabel: string,
    leftValue: string,
    rightLabel: string,
    rightValue: string,
) => {
    return (
        <tr className='d-flex flex-row'>
            <td className='d-flex flex-row w-50 border-bottom-0 border-right-0'>
                <div style={leftLabelStyle}>{leftLabel}</div>
                <div>{leftValue}</div>
            </td>
            <td className='d-flex flex-row w-50 border-bottom-0'>
                <div style={rightLabelStyle}>{rightLabel}</div>
                <div>{rightValue}</div>
            </td>
        </tr>
    );
};

export const ConstructionStatementHistoriesDetail: FC<Props> = ({
    csHistories,
}) => {
    const router = useRouter();
    const [selectedHistories, setSelectedHistories] = useState<number[]>([]);

    const onToggleHistory = (id: number) => {
        setSelectedHistories(prevSelection => {
            if (prevSelection.includes(id)) {
                return prevSelection.filter(i => i !== id);
            }
            return [...prevSelection, id];
        });
    };

    const fileUrl = (csHistory: ConstructionStatementHistory): string => {
        return (
            `${process.env.NEXT_PUBLIC_API_ORIGIN}${
                (csHistory.fileInfo as AttachmentInfo)?.path
            }` || ''
        );
    };
    return (
        <div hidden={!csHistories?.length}>
            {(csHistories || []).map(csHistory => (
                <Card className='p-3 my-4' key={csHistory.id}>
                    <div className='d-flex flex-row justify-content-between align-items-center my-3'>
                        <div>
                            {DateTime.fromJSDate(csHistory.createdAt).toFormat(
                                'yyyy/M/d hh:mm',
                            )}
                            <span className='ml-4'>変更予定</span>
                        </div>
                        <div>
                            <FA
                                icon={
                                    selectedHistories.includes(
                                        csHistory.id || 0,
                                    )
                                        ? faAngleUp
                                        : faAngleDown
                                }
                                role='button'
                                className='mx-2'
                                style={{ color: 'blue', fontSize: '40px' }}
                                onClick={() =>
                                    onToggleHistory(csHistory.id || 0)
                                }
                            />
                        </div>
                    </div>
                    {selectedHistories.includes(csHistory.id || 0) && (
                        <div>
                            <hr />
                            <div>
                                <span className='font-weight-bold'>
                                    変更内容
                                </span>
                                <Table bordered responsive>
                                    <tbody>
                                        {renderRow(
                                            '資産(差分)',
                                            csHistory.assetDifference?.toLocaleString() +
                                                '円' || '0円',
                                            '修繕費(差分)',
                                            csHistory.repairFeeDifference?.toLocaleString() +
                                                '円' || '0円',
                                        )}
                                        {renderRow(
                                            '撤去費(差分)',
                                            csHistory.removalFeeDifference?.toLocaleString() +
                                                '円' || '0円',
                                            '変更予定金額(総額)',
                                            calculateTotalScheduledChange(
                                                csHistory,
                                            ) + '円',
                                        )}
                                        {router.pathname.includes('design') ||
                                            renderRow(
                                                '工事工期',
                                                csHistory.constructionPeriod
                                                    ? DateTime.fromJSDate(
                                                          csHistory.constructionPeriod,
                                                      ).toFormat('yyyy年M月d日')
                                                    : '-',
                                                '検収予定日',
                                                csHistory.scheduledAcceptanceDate
                                                    ? DateTime.fromJSDate(
                                                          csHistory.scheduledAcceptanceDate,
                                                      ).toFormat('yyyy年M月d日')
                                                    : '-',
                                            )}
                                        {renderRow(
                                            '出来高金額',
                                            csHistory.partialPayment.toLocaleString() +
                                                '円' || '0円',
                                            '出来高検収予定日',
                                            csHistory.partialPaymentAcceptanceDate
                                                ? DateTime.fromJSDate(
                                                      csHistory.partialPaymentAcceptanceDate,
                                                  ).toFormat('yyyy年M月d日')
                                                : '-',
                                        )}
                                        <tr className='d-flex'>
                                            <td className='w-100 d-flex flex-row border-bottom-0'>
                                                <div style={bottomLabelStyle}>
                                                    変更理由
                                                </div>
                                                <div>
                                                    {csHistory.reasonForChange}
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className='d-flex'>
                                            <td className='w-100 d-flex flex-row'>
                                                <div style={bottomLabelStyle}>
                                                    変更資料
                                                </div>
                                                <a
                                                    href={fileUrl(csHistory)}
                                                    target='_blank'
                                                    style={{
                                                        textDecoration: 'none',
                                                    }}
                                                    rel='noreferrer'
                                                    hidden={
                                                        !(csHistory.fileInfo as AttachmentInfo)
                                                    }
                                                >
                                                    <FA
                                                        icon={faFile}
                                                        className='fa-light'
                                                    />{' '}
                                                    {
                                                        (
                                                            csHistory.fileInfo as AttachmentInfo
                                                        )?.filename
                                                    }
                                                </a>
                                            </td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    )}
                </Card>
            ))}
        </div>
    );
};
