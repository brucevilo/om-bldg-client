import React, { useState, FC, ChangeEvent } from 'react';
import {
    ListGroup,
    ToggleButton,
    ToggleButtonGroup,
    Form,
    Row,
    Col,
    InputGroup,
} from 'react-bootstrap';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import {
    ConstructionStatement,
    Contract,
    ConstructionStatementHistoryFormValue,
} from '@/Domain/Entity';
import { DateTime } from 'luxon';
import { NumberInput } from '@/Presentation/Component';

interface Props {
    constructionStatement: ConstructionStatement;
    contract: Contract;
    handleCsFormValuesOnchange: (
        id: number,
        value: Partial<ConstructionStatementHistoryFormValue>,
    ) => void;
    constructionStatementFormValue: ConstructionStatementHistoryFormValue;
}

const ChangeScheduleConstructionStatementRow: FC<Props> = ({
    constructionStatement,
    contract,
    handleCsFormValuesOnchange,
    constructionStatementFormValue,
}) => {
    const [isShowDetails, setIsShowDetails] = useState(false);

    const handleConstructionStatementClick = (
        id: number | null,
        value: string,
    ) => {
        if (!id) return;
        setIsShowDetails(value === 'true');
    };

    const getCurrentAmount = (
        asset: number,
        repairFee: number,
        removalFee: number,
    ): string => {
        return (
            Number(asset || 0) +
            Number(repairFee || 0) +
            Number(removalFee || 0)
        ).toLocaleString();
    };

    return (
        <>
            <ListGroup.Item className='border-0'>
                <div className='d-flex justify-content-between align-items-center border-bottom'>
                    <div
                        className='d-flex flex-column'
                        style={{
                            fontSize: '14px',
                        }}
                    >
                        <div className='font-weight-medium text-dark'>
                            {constructionStatement.name.toLocaleString() || '-'}
                        </div>
                        <div className='text-black-50'>
                            <span className='mr-3'>
                                当初金額：¥
                                {contract.expectedPrice?.toLocaleString() ||
                                    '-'}
                            </span>
                            <span className='mr-3'>
                                現状金額：
                                {constructionStatement.latestHistory()
                                    ? `¥${getCurrentAmount(
                                          constructionStatement.latestHistory()
                                              ?.assetDifference || 0,
                                          constructionStatement.latestHistory()
                                              ?.repairFeeDifference || 0,
                                          constructionStatement.latestHistory()
                                              ?.removalFeeDifference || 0,
                                      )}`
                                    : '-'}
                            </span>
                            <span className='mr-3'>
                                工事工期：
                                {constructionStatement.term
                                    ? DateTime.fromJSDate(
                                          constructionStatement.term,
                                      ).toFormat('yyyy/MM/dd')
                                    : '-'}
                            </span>
                            <span className='mr-3'>
                                検収予定日：
                                {constructionStatement.scheduledAcceptanceDate
                                    ? DateTime.fromJSDate(
                                          constructionStatement?.scheduledAcceptanceDate,
                                      ).toFormat('yyyy/MM/dd')
                                    : '-'}
                            </span>
                        </div>
                    </div>
                    <ToggleButtonGroup type='radio' name='radio'>
                        {[
                            { label: '変更なし', value: false },
                            { label: '変更あり', value: true },
                        ].map((radio, index) => (
                            <ToggleButton
                                key={index}
                                id={`radio-${index}`}
                                variant={
                                    isShowDetails == radio.value
                                        ? 'btn bg-primary text-white'
                                        : 'btn border'
                                }
                                name='radio'
                                value={radio.value.toString()}
                                onChange={e =>
                                    handleConstructionStatementClick(
                                        constructionStatement.id,
                                        e.target.value,
                                    )
                                }
                            >
                                {radio.label}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </div>
                {isShowDetails ? (
                    <div className='d-flex flex-column pt-2 border-bottom'>
                        <div className='d-flex align-items-center mt-3 mb-2'>
                            <div className='bg-danger text-white px-2 mr-3 rounded'>
                                必須
                            </div>
                            <div className='font-weight-bold text-dark'>
                                変更内容
                            </div>
                        </div>
                        <Row className='mb-2'>
                            <Col>
                                <InputGroup className='d-flex align-items-center'>
                                    <InputGroup.Text className='bg-white'>
                                        資産(差分)
                                    </InputGroup.Text>
                                    <NumberInput
                                        required
                                        className='rounded-right border p-sm-1 text-right'
                                        value={
                                            constructionStatementFormValue.assetDifference?.toString() ||
                                            ''
                                        }
                                        onChange={e =>
                                            handleCsFormValuesOnchange(
                                                constructionStatement?.id || 0,
                                                { assetDifference: Number(e) },
                                            )
                                        }
                                    />
                                    <span className='mx-1'>円</span>
                                </InputGroup>
                            </Col>
                            <Col>
                                <InputGroup className='d-flex align-items-center'>
                                    <InputGroup.Text className='bg-white'>
                                        撤去費(差分)
                                    </InputGroup.Text>
                                    <NumberInput
                                        required
                                        className='rounded-right border p-sm-1 text-right'
                                        value={
                                            constructionStatementFormValue.repairFeeDifference?.toString() ||
                                            ''
                                        }
                                        onChange={e =>
                                            handleCsFormValuesOnchange(
                                                constructionStatement?.id || 0,
                                                {
                                                    repairFeeDifference:
                                                        Number(e),
                                                },
                                            )
                                        }
                                    />
                                    <span className='mx-1'>円</span>
                                </InputGroup>
                            </Col>
                            <Col>
                                <InputGroup className='d-flex align-items-center'>
                                    <InputGroup.Text className='bg-white'>
                                        撤去費(差分)
                                    </InputGroup.Text>
                                    <NumberInput
                                        required
                                        className='rounded-right border p-sm-1 text-right'
                                        value={
                                            constructionStatementFormValue.removalFeeDifference?.toString() ||
                                            ''
                                        }
                                        onChange={e =>
                                            handleCsFormValuesOnchange(
                                                constructionStatement?.id || 0,
                                                {
                                                    removalFeeDifference:
                                                        Number(e),
                                                },
                                            )
                                        }
                                    />
                                    <span className='mx-1'>円</span>
                                </InputGroup>
                            </Col>
                            <Col>
                                <InputGroup className='d-flex align-items-center'>
                                    <InputGroup.Text className='bg-white'>
                                        変更予定金額(総額)
                                    </InputGroup.Text>
                                    <Form.Control
                                        value={getCurrentAmount(
                                            constructionStatementFormValue?.assetDifference ||
                                                0,
                                            constructionStatementFormValue?.repairFeeDifference ||
                                                0,
                                            constructionStatementFormValue.removalFeeDifference ||
                                                0,
                                        )}
                                        disabled
                                    />
                                    <span className='mx-1'>円</span>
                                </InputGroup>
                            </Col>
                        </Row>
                        <Row className='mb-2'>
                            <Col lg={3}>
                                <InputGroup className='d-flex align-items-center'>
                                    <InputGroup.Text className='bg-white'>
                                        工事工期
                                    </InputGroup.Text>
                                    <Form.Control
                                        type='date'
                                        value={
                                            constructionStatementFormValue.constructionPeriod
                                                ? DateTime.fromJSDate(
                                                      constructionStatementFormValue.constructionPeriod,
                                                  ).toISODate()
                                                : ''
                                        }
                                        onChange={e =>
                                            handleCsFormValuesOnchange(
                                                constructionStatement?.id || 0,
                                                {
                                                    constructionPeriod: e.target
                                                        .value
                                                        ? new Date(
                                                              e.target.value,
                                                          )
                                                        : null,
                                                },
                                            )
                                        }
                                    />
                                </InputGroup>
                            </Col>
                            <Col lg={3}>
                                <InputGroup className='d-flex align-items-center'>
                                    <InputGroup.Text className='bg-white'>
                                        検収予定日
                                    </InputGroup.Text>
                                    <Form.Control
                                        type='date'
                                        value={
                                            constructionStatementFormValue.scheduledAcceptanceDate
                                                ? DateTime.fromJSDate(
                                                      constructionStatementFormValue.scheduledAcceptanceDate,
                                                  ).toISODate()
                                                : ''
                                        }
                                        onChange={e =>
                                            handleCsFormValuesOnchange(
                                                constructionStatement?.id || 0,
                                                {
                                                    scheduledAcceptanceDate: e
                                                        .target.value
                                                        ? new Date(
                                                              e.target.value,
                                                          )
                                                        : null,
                                                },
                                            )
                                        }
                                    />
                                </InputGroup>
                            </Col>
                        </Row>
                        <Row className='mb-2'>
                            <Col lg={3}>
                                <InputGroup className='d-flex align-items-center'>
                                    <InputGroup.Text className='bg-white'>
                                        出来高金額
                                    </InputGroup.Text>
                                    <NumberInput
                                        required
                                        className='rounded-right border p-sm-1 text-right'
                                        value={
                                            constructionStatementFormValue.partialPayment?.toString() ||
                                            ''
                                        }
                                        onChange={e =>
                                            handleCsFormValuesOnchange(
                                                constructionStatement?.id || 0,
                                                { partialPayment: Number(e) },
                                            )
                                        }
                                    />
                                    <span className='mx-1'>円</span>
                                </InputGroup>
                            </Col>
                            <Col lg={3}>
                                <InputGroup className='d-flex align-items-center'>
                                    <InputGroup.Text className='bg-white'>
                                        出来高検収予定日
                                    </InputGroup.Text>
                                    <Form.Control
                                        type='date'
                                        value={
                                            constructionStatementFormValue.partialPaymentAcceptanceDate
                                                ? DateTime.fromJSDate(
                                                      constructionStatementFormValue.partialPaymentAcceptanceDate,
                                                  ).toISODate()
                                                : ''
                                        }
                                        onChange={e =>
                                            handleCsFormValuesOnchange(
                                                constructionStatement?.id || 0,
                                                {
                                                    partialPaymentAcceptanceDate:
                                                        e.target.value
                                                            ? new Date(
                                                                  e.target.value,
                                                              )
                                                            : null,
                                                },
                                            )
                                        }
                                    />
                                </InputGroup>
                            </Col>
                        </Row>
                        <div className='d-flex align-items-center mb-2'>
                            <div className='bg-secondary text-white pr-2 pl-2 mr-3 rounded'>
                                任意
                            </div>
                            <div className='font-weight-bold text-dark'>
                                変更理由
                            </div>
                        </div>
                        <Form.Group className='mb-2'>
                            <Form.Control
                                as='textarea'
                                style={{
                                    width: '100%',
                                }}
                                rows={3}
                                className='pl-2'
                                placeholder='変更理由を入力してください。'
                                value={
                                    constructionStatementFormValue?.reasonForChange ||
                                    ''
                                }
                                onChange={e =>
                                    handleCsFormValuesOnchange(
                                        constructionStatement?.id || 0,
                                        { reasonForChange: e.target.value },
                                    )
                                }
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label
                                className='border rounded-left p-sm-1'
                                style={{
                                    cursor: 'pointer',
                                }}
                            >
                                <Form.File.Input
                                    className='d-none'
                                    onChange={(
                                        e: ChangeEvent<HTMLInputElement>,
                                    ) => {
                                        if (!e.target.files) return;
                                        handleCsFormValuesOnchange(
                                            constructionStatement?.id || 0,
                                            { file: e.target.files[0] },
                                        );
                                    }}
                                />
                                <FA icon={faUpload} />
                                <span className='pl-1'>変更資料を選択</span>
                            </Form.Label>
                            {(constructionStatementFormValue?.file ||
                                constructionStatementFormValue.fileInfo) && (
                                <Form.Label className='border py-1 px-2'>
                                    {constructionStatementFormValue.file
                                        ? constructionStatementFormValue?.file
                                              ?.name
                                        : constructionStatementFormValue
                                              .fileInfo?.filename}
                                </Form.Label>
                            )}
                        </Form.Group>
                    </div>
                ) : null}
            </ListGroup.Item>
        </>
    );
};
export default ChangeScheduleConstructionStatementRow;
