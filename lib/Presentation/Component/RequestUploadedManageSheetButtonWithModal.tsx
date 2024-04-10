import React, { useState, FC } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { ManageSheetService, Stage } from '@/App/Service';
import { assertsIsExists } from '@/Infrastructure';

interface Props {
    constructionId: number;
    stage: Stage;
}

export const RequestUpdateManageSheetButtonWithModal: FC<Props> = (
    props: Props,
) => {
    const [showModal, setShowModal] = useState<boolean>(false);
    const [file, setFile] = useState<File>();
    const { constructionId, stage } = props;

    const onSubmit: React.FormEventHandler = async e => {
        e.preventDefault();
        assertsIsExists(file, 'ファイルが選択されていません');
        switch (stage) {
            case Stage.Estimate:
                await ManageSheetService.updateForEstimated(constructionId);
                break;
            case Stage.Agreement:
                await ManageSheetService.updateForAgreement(
                    constructionId,
                    file,
                );
                break;
        }

        alert(
            '工事管理シートの更新リクエストを行いました。編集完了通知をお待ちください',
        );
        setShowModal(false);
    };
    return (
        <>
            <Button onClick={() => setShowModal(true)}>
                工事管理シートを
                {ManageSheetService.stageToText(stage)}
                後に更新
            </Button>
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header>
                    <Modal.Title>工事管理シートを更新</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={onSubmit}>
                        <div className='d-flex justify-content-between'>
                            <input
                                required
                                type='file'
                                onChange={e =>
                                    e.target.files && setFile(e.target.files[0])
                                }
                            />
                            <Button className='text-right' type='submit'>
                                更新
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};
