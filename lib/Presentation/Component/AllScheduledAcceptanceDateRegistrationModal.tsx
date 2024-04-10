import { ConstructionStatement, Contract } from '@/Domain/Entity';
import { ConstructionStatementRepository } from '@/Domain/Repository';
import React, { FC, FormEventHandler, useState } from 'react';
import { Form, Modal, ModalProps, Button } from 'react-bootstrap';

export const AllScheduledAcceptanceDateRegistrationModal: FC<
    ModalProps & {
        constructionStatements: ConstructionStatement[];
        setConstructionStatements: React.Dispatch<
            React.SetStateAction<ConstructionStatement[] | []>
        >;
        contract: Contract;
        onHide: () => void;
    }
> = props => {
    const {
        constructionStatements,
        setConstructionStatements,
        contract,
        ...modalProps
    } = props;
    const [scheduledAcceptanceDate, setScheduledAcceptanceDate] =
        useState<string>('');
    const onSubmit: FormEventHandler = async e => {
        try {
            e.preventDefault();
            if (!contract.ownerId) {
                throw new Error('工事の作成者が紐付いておりません');
            }
            const newConstructionStatements = constructionStatements.map(cs => {
                return new ConstructionStatement(
                    cs.id,
                    cs.contractId,
                    cs.name,
                    cs.projectCode,
                    cs.term,
                    cs.costItems,
                    cs.classification,
                    cs.isRetiremented,
                    cs.isConstructionInProgressCompleted,
                    cs.retirement,
                    new Date(scheduledAcceptanceDate),
                    cs.isCollateral,
                    cs.previousConstructionStatementId,
                    cs.previousConstructionStatement,
                    null,
                    cs.constructionStatementHistories,
                    cs.createdAt,
                    cs.updatedAt,
                );
            });
            await ConstructionStatementRepository.updateConstructionStatementsScheduledAcceptanceDate(
                newConstructionStatements,
            );
            setConstructionStatements([]);
            modalProps.onHide();
        } catch (e) {
            if (e instanceof Error) {
                alert(e.message);
            }
        }
    };
    return (
        <Modal {...modalProps}>
            <Modal.Header closeButton>
                <Modal.Title>工事編集</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={onSubmit}>
                    <Form.Group>
                        <Form.Label>検収予定日</Form.Label>
                        <Form.Control
                            required
                            placeholder='検収予定日を入力してください'
                            type='date'
                            value={scheduledAcceptanceDate}
                            onChange={e =>
                                setScheduledAcceptanceDate(e.target.value)
                            }
                            min='1900-01-01'
                            max='3000-01-01'
                        />
                    </Form.Group>
                    <div className='text-right'>
                        <Button
                            type='submit'
                            variant='light'
                            className='bg-white border'
                        >
                            確定
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};
