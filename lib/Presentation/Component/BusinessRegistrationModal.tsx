import { WBSSheetService } from '@/App/Service/WBSSheetService';
import React, {
    useState,
    FC,
    ChangeEvent,
    FormEventHandler,
    useEffect,
} from 'react';
import { Button, Form, Modal, ModalProps, Spinner } from 'react-bootstrap';
import { map, uniq } from 'lodash';

export const BusinessRegistrationModal: FC<
    {
        onHide: () => void;
        fetchData: () => void;
        fetchProjectWithWbs: () => void;
    } & ModalProps
> = ({ fetchData, fetchProjectWithWbs, ...modalProps }) => {
    const [wbsDocument, setWbsDocument] = useState<File>();
    const [wbsRemarks, setWbsRemarks] = useState<string>('');
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [listOfTargetYear, setListOfTargetYear] = useState<number[]>([]);
    const onSubmit: FormEventHandler = async e => {
        e.preventDefault();

        if (!wbsDocument) return;

        setIsUploading(true);
        if (
            wbsDocument.type.toLocaleLowerCase() !==
            'application/vnd.ms-excel.sheet.macroenabled.12'
        ) {
            setIsUploading(false);
            modalProps.onHide();
            alert('エクセルファイルを指定してください');
            return;
        }
        WBSSheetService.upload(wbsDocument, wbsRemarks, listOfTargetYear)
            .then(() => {
                alert('WBSを登録しました');
            })
            .catch((error: unknown) => {
                if (error instanceof Error) {
                    alert(error.message);
                }
            })
            .finally(() => {
                fetchData();
                fetchProjectWithWbs();
                setIsUploading(false);
                modalProps.onHide();
            });
    };

    useEffect(() => {
        if (modalProps.projects.length !== 0) {
            setListOfTargetYear(uniq(map(modalProps.projects, 'targetYear')));
        }
    }, [wbsDocument]);

    return (
        <Modal {...modalProps}>
            <Modal.Header>
                <Modal.Title className='font-weight-bold'>事業登録</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={onSubmit}>
                    <Form.Group>
                        <Form.Label>
                            <span className='mr-2 badge badge-danger'>
                                必須{' '}
                            </span>
                            <span className='font-weight-medium'>
                                {' '}
                                WBSファイル
                            </span>
                        </Form.Label>
                        <Form.Control
                            required
                            type='file'
                            className='font-weight-medium'
                            id='excel-file-id'
                            accept='.xls,.xlsx,.xlsm'
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                if (!e.target.files) return;
                                setWbsDocument(e.target.files[0]);
                            }}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>
                            {' '}
                            <span className='mr-2 badge badge-secondary'>
                                任意
                            </span>
                            <span className='font-weight-medium'>メモ</span>
                        </Form.Label>
                        <Form.Control
                            type='textarea'
                            className='font-weight-medium'
                            style={{ height: '66px' }}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                if (!e.target.value) return;
                                setWbsRemarks(e.target.value);
                            }}
                        />
                    </Form.Group>

                    <div className='text-right'>
                        <Button
                            onClick={() => {
                                modalProps.onHide();
                            }}
                            className='mr-2 font-weight-bold'
                            variant='outline-dark'
                        >
                            キャンセル
                        </Button>
                        {isUploading ? (
                            <Button
                                variant='light'
                                className='bg-white border'
                                disabled
                            >
                                <Spinner
                                    as='span'
                                    animation='grow'
                                    size='sm'
                                    role='status'
                                    aria-hidden='true'
                                />
                                Loading...
                            </Button>
                        ) : (
                            <Button
                                type='submit'
                                disabled={!wbsDocument}
                                variant='outline-dark'
                                className='mr-2 font-weight-bold'
                            >
                                登録
                            </Button>
                        )}
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};
