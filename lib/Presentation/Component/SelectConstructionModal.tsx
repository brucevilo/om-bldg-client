import React, { FC, useState, useEffect } from 'react';
import { Modal, ModalProps, Form, Button } from 'react-bootstrap';
import { Construction } from '@/Domain/Entity';
import { ConstructionRepository } from '@/Domain/Repository';

export const SelectConstructionModal: FC<
    ModalProps & {
        onSelectConstruction: (constructionId: number) => void;
        title?: string;
    }
> = props => {
    const [constructionQuery, setConstructionQuery] = useState('');
    const [constructions, setConstructions] = useState<Construction[]>([]);

    useEffect(() => {
        ConstructionRepository.index().then(setConstructions);
    }, []);

    const { onSelectConstruction, ...modalProps } = props;

    const onSubmit = () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [constructionId, ...other] = constructionQuery.split(':');
        const construction = constructions.find(
            c => c.id === Number(constructionId),
        );
        if (!construction) return alert('指定されたプロジェクトが存在しません');
        onSelectConstruction(construction.id as number);
    };

    return (
        <Modal {...modalProps}>
            <Modal.Header closeButton>
                <Modal.Title>工事登録</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group>
                    <Form.Label>工事</Form.Label>
                    <input
                        className='form-control'
                        required
                        autoComplete='on'
                        list='constructions'
                        placeholder='工事を選択してください'
                        type='text'
                        value={constructionQuery}
                        onChange={e => setConstructionQuery(e.target.value)}
                    />
                    <datalist id='constructions'>
                        {constructions.map(p => (
                            <option key={p.id}>
                                {p.id}:{p.name}
                            </option>
                        ))}
                    </datalist>
                </Form.Group>
                <Button onClick={onSubmit}>選択</Button>
            </Modal.Body>
        </Modal>
    );
};
