import React, { FC, useState, useEffect } from 'react';
import { Modal, ModalProps, Form, Button } from 'react-bootstrap';
import { Design } from '@/Domain/Entity';
import { DesignRepository } from '@/Domain/Repository';

export const SelectDesignModal: FC<
    ModalProps & {
        onSelectDesign: (designId: number) => void;
        title?: string;
    }
> = props => {
    const [designQuery, setDesignQuery] = useState('');
    const [designs, setDesigns] = useState<Design[]>([]);

    useEffect(() => {
        DesignRepository.index().then(setDesigns);
    }, []);

    const { onSelectDesign, title, ...modalProps } = props;

    const onSubmit = () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [designId, ...other] = designQuery.split(':');
        const design = designs.find(d => d.id === Number(designId));
        if (!design) return alert('指定されたプロジェクトが存在しません');
        onSelectDesign(design.id as number);
    };

    return (
        <Modal {...modalProps}>
            <Modal.Header closeButton>
                <Modal.Title>{title || '設計登録'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group>
                    <Form.Label>設計</Form.Label>
                    <input
                        className='form-control'
                        required
                        autoComplete='on'
                        list='designs'
                        placeholder='設計を選択してください'
                        type='text'
                        value={designQuery}
                        onChange={e => setDesignQuery(e.target.value)}
                    />
                    <datalist id='designs'>
                        {designs.map(p => (
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
