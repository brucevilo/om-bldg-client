import { Construction, ConstructionStatement } from '@/Domain/Entity';
import { ConstructionStatementRepository } from '@/Domain/Repository';
import { useRouter } from 'next/router';
import React, { FC, FormEventHandler, useState } from 'react';
import { Form, Modal, ModalProps, Button } from 'react-bootstrap';
import { DateTime } from 'luxon';

export const RegistrationScheduledAcceptanceDateModal: FC<
    ModalProps & {
        construction: Construction;
        constructionStatements: ConstructionStatement[];
    }
> = props => {
    const router = useRouter();
    const { construction, ...modalProps } = props;
    const [constructionStatements, setConstructionStatements] = useState<
        ConstructionStatement[]
    >(props.constructionStatements);
    const onSubmit: FormEventHandler = async e => {
        e.preventDefault();
        router.push(`/constructions/${construction.id}/summary`);
        await ConstructionStatementRepository.updateConstructionStatementsScheduledAcceptanceDate(
            constructionStatements,
        );
    };
    const setScheduledAcceptanceDate = (
        constructionStatement: ConstructionStatement,
        scheduledAcceptanceDate: string,
    ) => {
        const cs = new ConstructionStatement(
            constructionStatement.id,
            constructionStatement.contractId,
            constructionStatement.name,
            constructionStatement.projectCode,
            constructionStatement.term,
            constructionStatement.costItems,
            constructionStatement.classification,
            constructionStatement.isRetiremented,
            constructionStatement.isConstructionInProgressCompleted,
            constructionStatement.retirement,
            new Date(scheduledAcceptanceDate),
            constructionStatement.isCollateral,
            constructionStatement.previousConstructionStatementId,
            constructionStatement.previousConstructionStatement,
            null,
            constructionStatement.constructionStatementHistories,
            constructionStatement.createdAt,
            constructionStatement.updatedAt,
        );
        setConstructionStatements(
            constructionStatements.map(_cs => {
                if (cs.id !== _cs.id) return _cs;
                return cs;
            }),
        );
    };
    return (
        <Modal {...modalProps} size='lg'>
            <Modal.Header closeButton>
                <Modal.Title>検収予定日更新 {construction.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form onSubmit={onSubmit}>
                    <div className='d-flex'>
                        <p className='mr-4' style={{ width: '60%' }}>
                            工事明細名
                        </p>
                        <p style={{ width: '40%' }}>検収予定日</p>
                    </div>
                    {constructionStatements.map(cs => (
                        <div key={cs.id} className='d-flex'>
                            <p className='mr-4' style={{ width: '60%' }}>
                                {cs.name}
                            </p>
                            <Form.Group>
                                <Form.Control
                                    required
                                    placeholder='検収予定日を入力してください'
                                    type='date'
                                    value={
                                        cs.scheduledAcceptanceDate
                                            ? DateTime.fromJSDate(
                                                  cs.scheduledAcceptanceDate,
                                              ).toFormat('yyyy-MM-dd')
                                            : ''
                                    }
                                    onChange={e =>
                                        setScheduledAcceptanceDate(
                                            cs,
                                            e.target.value,
                                        )
                                    }
                                    min='1900-01-01'
                                    max='3000-01-01'
                                />
                            </Form.Group>
                        </div>
                    ))}
                    <div className='text-right'>
                        <Button type='submit'>登録</Button>
                    </div>
                </form>
            </Modal.Body>
        </Modal>
    );
};
