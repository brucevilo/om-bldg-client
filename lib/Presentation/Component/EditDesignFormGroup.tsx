import React, { FC } from 'react';
import { Form, Row, Col, Badge, Button } from 'react-bootstrap';
import { EditDesignForm } from '@/App/Service';
import { DesignContractType } from '@/Domain/Entity';
import { StaffSelector } from './StaffSelector';

interface Props {
    editForm: EditDesignForm;
    onSubmit: React.FormEventHandler;
    onChange: (editForm: EditDesignForm) => void;
    designId?: number;
}

export const EditDesignFormGroup: FC<Props> = ({
    editForm,
    onChange,
    onSubmit,
    designId,
}) => {
    const isInternal = editForm.contractType === DesignContractType.Internal;
    return (
        <form onSubmit={onSubmit}>
            <Form.Group as={Row}>
                <Form.Label column sm='3'>
                    <Badge variant='danger' className='mr-3'>
                        必須
                    </Badge>
                    <span className='font-weight-bold'>内製 or 外注</span>
                </Form.Label>
                <Col sm='9'>
                    <div>
                        <Form.Check
                            inline
                            label='内製'
                            type='radio'
                            id='内製'
                            checked={
                                editForm.contractType ===
                                DesignContractType.Internal
                            }
                            onChange={() =>
                                onChange({
                                    ...editForm,
                                    contractType: DesignContractType.Internal,
                                })
                            }
                        />
                        <Form.Check
                            inline
                            label='外注'
                            type='radio'
                            id='外注'
                            checked={
                                editForm.contractType ===
                                DesignContractType.External
                            }
                            onChange={() =>
                                onChange({
                                    ...editForm,
                                    contractType: DesignContractType.External,
                                })
                            }
                        />
                    </div>
                </Col>
            </Form.Group>
            <Form.Group as={Row}>
                <Form.Label column sm='3'>
                    <Badge variant='danger' className='mr-3'>
                        必須
                    </Badge>
                    <span className='font-weight-bold'>設計名</span>
                </Form.Label>
                <Col sm='9'>
                    <input
                        className='form-control'
                        value={editForm.name}
                        onChange={e =>
                            onChange({
                                ...editForm,
                                name: e.target.value,
                            })
                        }
                        placeholder='設計名を入力してください。'
                    />
                </Col>
            </Form.Group>
            {designId && (
                <Form.Group as={Row}>
                    <Form.Label column sm='3'>
                        <Badge variant='danger' className='mr-3'>
                            必須
                        </Badge>
                        <span className='font-weight-bold'>設計書番号</span>
                    </Form.Label>
                    <Col sm='9'>
                        <input
                            className='form-control'
                            value={editForm.documentNumber}
                            onChange={e =>
                                onChange({
                                    ...editForm,
                                    documentNumber: e.target.value,
                                })
                            }
                            placeholder='設計番号を入力してください。'
                            pattern='\d{8}'
                            title='設計書番号は数字８桁で入力してください'
                        />
                    </Col>
                </Form.Group>
            )}
            {isInternal && (
                <Form.Group as={Row}>
                    <Form.Label column sm='3'>
                        <Badge variant='danger' className='mr-3'>
                            必須
                        </Badge>
                        <span className='font-weight-bold'>設計担当係長</span>
                    </Form.Label>
                    <Col sm='9'>
                        <StaffSelector
                            value={editForm.designChiefId?.toString() || ''}
                            required
                            onChange={id =>
                                onChange({
                                    ...editForm,
                                    designChiefId: id,
                                })
                            }
                        />
                    </Col>
                </Form.Group>
            )}
            <Form.Group as={Row}>
                <Form.Label column sm='3'>
                    <Badge variant='danger' className='mr-3'>
                        必須
                    </Badge>
                    <span className='font-weight-bold'>設計担当者</span>
                </Form.Label>
                <Col sm='9'>
                    <StaffSelector
                        value={editForm.designStaffId?.toString() || ''}
                        required
                        onChange={id =>
                            onChange({
                                ...editForm,
                                designStaffId: id,
                            })
                        }
                    />
                </Col>
            </Form.Group>
            <Form.Group as={Row}>
                <Form.Label column sm='3'>
                    <Badge variant='danger' className='mr-3'>
                        必須
                    </Badge>
                    <span className='font-weight-bold'>設計期間</span>
                </Form.Label>
                <Col sm='9'>
                    <Row>
                        <Col>
                            <Form.Group>
                                {isInternal ? (
                                    <>
                                        <Form.Label>設計開始日</Form.Label>
                                        <input
                                            type='date'
                                            className='form-control'
                                            value={editForm.startAt}
                                            onChange={e =>
                                                onChange({
                                                    ...editForm,
                                                    startAt: e.target.value,
                                                })
                                            }
                                            max='3000-12-31'
                                        />
                                    </>
                                ) : (
                                    <>
                                        <Form.Label>契約予定日</Form.Label>
                                        <input
                                            type='date'
                                            className='form-control'
                                            value={editForm.expectedStartAt}
                                            onChange={e =>
                                                onChange({
                                                    ...editForm,
                                                    expectedStartAt:
                                                        e.target.value,
                                                })
                                            }
                                            max='3000-12-31'
                                        />
                                    </>
                                )}
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group>
                                <Form.Label>
                                    {isInternal ? '設計完了予定日' : '完成期限'}
                                </Form.Label>
                                <input
                                    type='date'
                                    className='form-control'
                                    value={editForm.expectedEndAt}
                                    onChange={e =>
                                        onChange({
                                            ...editForm,
                                            expectedEndAt: e.target.value,
                                        })
                                    }
                                    max='3000-12-31'
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Col>
            </Form.Group>
            {isInternal && (
                <Form.Group as={Row}>
                    <Form.Label column sm='3'>
                        <Badge variant='danger' className='mr-3'>
                            必須
                        </Badge>
                        <span className='font-weight-bold'>
                            積算持ち込み予定日
                        </span>
                    </Form.Label>
                    <Col sm='9'>
                        <Form.Control
                            type='date'
                            value={editForm.endAt}
                            onChange={e =>
                                onChange({
                                    ...editForm,
                                    endAt: e.target.value,
                                })
                            }
                            max='3000-12-31'
                        />
                    </Col>
                </Form.Group>
            )}
            <Form.Group as={Row}>
                <Form.Label column sm='3'>
                    <Badge variant='secondary' className='mr-3'>
                        任意
                    </Badge>
                    <span className='font-weight-bold'>
                        {isInternal ? '工事契約予定日' : '本体工事発注予定日'}
                    </span>
                </Form.Label>
                <Col sm='9'>
                    <Form.Control
                        type='date'
                        value={
                            editForm.expectedConstructionOrderDateWhenDesigning
                        }
                        onChange={e =>
                            onChange({
                                ...editForm,
                                expectedConstructionOrderDateWhenDesigning:
                                    e.target.value,
                            })
                        }
                        max='3000-12-31'
                    />
                </Col>
            </Form.Group>
            <Form.Group as={Row}>
                <Form.Label column sm='3'>
                    <Badge variant='secondary' className='mr-3'>
                        任意
                    </Badge>
                    <span className='font-weight-bold'>メモ</span>
                </Form.Label>
                <Col sm='9'>
                    <textarea
                        className='form-control'
                        value={editForm.memo}
                        onChange={e =>
                            onChange({
                                ...editForm,
                                memo: e.target.value,
                            })
                        }
                        placeholder='メモを入力してください。'
                        rows={6}
                    />
                </Col>
            </Form.Group>
            <div className='text-right'>
                <Button
                    type='submit'
                    variant='light'
                    className='bg-white border'
                >
                    登録
                </Button>
            </div>
        </form>
    );
};
