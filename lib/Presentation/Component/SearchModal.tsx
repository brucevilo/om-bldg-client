import React, { FC, useState } from 'react';
import { Button, Form, Modal, ModalProps } from 'react-bootstrap';

export const SearchModal: FC<
    { onSearch: (keyword: string) => void } & ModalProps
> = ({ onSearch, ...modalProps }) => {
    const [keyword, setKeyword] = useState('');
    return (
        <Modal {...modalProps}>
            <Modal.Header>
                <Modal.Title>詳細検索</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form
                    onSubmit={e => {
                        e.preventDefault();
                        onSearch(keyword);
                    }}
                >
                    <Form.Group>
                        <Form.Label>検索内容</Form.Label>
                        <Form.Control
                            value={keyword}
                            onChange={e => setKeyword(e.target.value)}
                        />
                    </Form.Group>
                    <div className='text-right'>
                        <Button type='submit' variant='outline-dark'>
                            検索する
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};
