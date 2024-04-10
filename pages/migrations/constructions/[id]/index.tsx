import React, { ChangeEvent, FC, useEffect, useRef, useState } from 'react';
import { Page } from '@/Presentation/Component';
import { GetServerSideProps, NextPage } from 'next';
import Link from 'next/link';
import {
    Navbar,
    Nav,
    Table,
    Card,
    Button,
    Modal,
    Form,
    FormGroup,
    FormLabel,
    ModalProps,
} from 'react-bootstrap';
import { Construction } from '@/Domain/Entity';
import { ConstructionRepository } from '@/Domain/Repository';
import Styles from '@/Presentation/Style/Components/MigratedFileTable.module.scss';
import {
    EditMigratedConstructionFile,
    EditMigratedConstructionContractFileForm,
} from '@/App/Service/EditMigratedConstructionContractFile';
import { MigratedConstructionMotoSekkeiRow } from '@/Presentation/Component/MigratedConstructionMotoSekkeiRow';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUpload } from '@fortawesome/free-solid-svg-icons';
import { MigratedConstructionSekkeiHenkouRow } from '@/Presentation/Component/MigratedConstructionSekkeiHenkouRow';
import { MigratedConstructionRepository } from '@/App/Migrations/apps/repositories/ConstructionRepository';
import { AttachmentService } from '@/App/Service';
interface Props {
    constructionId: number;
}

interface AddButtonProps {
    onAddColumn: () => void;
}

const AddColumnButton: FC<AddButtonProps> = props => {
    return (
        <tr>
            <th
                style={{
                    border: 'none',
                    height: '3.5rem',
                }}
            ></th>
            <td style={{ border: 'none' }}>
                <Button
                    variant='outline-secondary'
                    className='px-2 py-0'
                    type='button'
                    onClick={() => {
                        props.onAddColumn();
                    }}
                >
                    <FontAwesomeIcon icon={faPlus} />
                </Button>
            </td>
        </tr>
    );
};

interface SubmitModalProps extends ModalProps {
    onSubmit: () => void;
    onHide: () => void;
}

const SubmitModal: FC<SubmitModalProps> = ({ onSubmit, ...modalProps }) => {
    return (
        <Modal {...modalProps}>
            <Modal.Header
                className='text-white'
                style={{ backgroundColor: '#666666', color: 'white' }}
                closeButton
            >
                <Modal.Title>
                    <h5 className='m-0'>移行開始</h5>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={onSubmit}>
                    <FormGroup>
                        <FormLabel>
                            登録されたファイルで工事の移行を開始します。
                            <br />
                            よろしいですか？
                        </FormLabel>
                    </FormGroup>
                    <div className='text-right'>
                        <Button
                            className='border mr-2'
                            variant='light'
                            onClick={modalProps.onHide}
                        >
                            キャンセル
                        </Button>
                        <Button
                            className='border'
                            variant='light'
                            onClick={e => {
                                e.preventDefault();
                                onSubmit();
                            }}
                        >
                            開始
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export const MigratedConstructionDetailPage: NextPage<Props> = props => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [construction, setConstruction] = useState<Construction>();
    const [forms, setForms] = useState<
        EditMigratedConstructionContractFileForm[]
    >([EditMigratedConstructionFile.createEmptyForm()]);
    const [show, setShow] = useState<boolean>(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const construction = await ConstructionRepository.get(
            props.constructionId,
        );
        setConstruction(construction);

        const forms = construction.contracts.map(contract =>
            EditMigratedConstructionFile.contractToForm(contract),
        );
        forms.length && setForms(forms);
    };

    const addColumn = () => {
        setForms(prevState => [
            ...prevState,
            EditMigratedConstructionFile.createEmptyForm(),
        ]);
    };

    const setNewForm = (
        newForm: EditMigratedConstructionContractFileForm,
        index: number,
    ): void => {
        setForms(prevState => {
            // 例）[1,2,3,4,5]で3を9999に入れ替えたい場合、[1,2]と[4,5]を持ってきて、(...[1,2], 9999, ...[4,5]) => [1,2,9999,4,5]みたいにする
            const currentFormsFromZeroToIndex = prevState.slice(0, index);
            const currentFormsIndexPlus1ToEnd = prevState.slice(
                index + 1,
                prevState.length,
            );
            return [
                ...currentFormsFromZeroToIndex,
                newForm,
                ...currentFormsIndexPlus1ToEnd,
            ];
        });
    };

    const onSubmit = async () => {
        const params = EditMigratedConstructionFile.formToContractParams(forms);
        const result =
            await MigratedConstructionRepository.updateMigratedConstructionContract(
                props.constructionId,
                params,
            );
        result && alert('更新しました');
        location.reload();
    };

    const fileName = () => {
        if (forms[0].manageSheetName) return forms[0].manageSheetName;

        return construction &&
            construction.contracts[0].manageSheetInfo?.filename
            ? construction.contracts[0].manageSheetInfo?.filename
            : '未登録';
    };

    return (
        <Page>
            <Navbar bg='white' className='px-5'>
                <Link href='/migrations' passHref>
                    <Nav.Link className='text-dark font-weight-bold mr-4'>
                        ←
                    </Nav.Link>
                </Link>
                <Navbar.Text>
                    <h5 className='text-dark font-weight-bold mb-0'>
                        {construction?.name || '工事名未登録'}
                    </h5>
                </Navbar.Text>
            </Navbar>
            <section>
                <Card className='p-4'>
                    <div
                        className='d-flex mb-4'
                        style={{ justifyContent: 'space-between' }}
                    >
                        <div>
                            <h6 className='font-weight-bold mb-0'>
                                {construction?.name || '工事名未登録'}
                            </h6>
                            <small className='text-gray d-block'>
                                移行するファイルをアップロードしてください
                            </small>
                        </div>
                        <div>
                            <Link
                                href={`/migrations/constructions/${props.constructionId}/edit`}
                                passHref
                            >
                                <Button
                                    variant='outline-danger'
                                    className='mr-2'
                                    as='a'
                                >
                                    自動で取り込めない項目を手動で編集する
                                </Button>
                            </Link>
                            <Button onClick={() => setShow(true)}>
                                移行開始
                            </Button>
                        </div>
                    </div>
                    <div className='table-responsive'>
                        {/* 列を追加するとコードが複雑になりそうなため、CSSで行列を入れ替えつつ工事変更の数だけtrを追加する形で実装 */}
                        <Table
                            className={`mb-4 ${Styles.swapped_columns_table}`}
                            bordered
                        >
                            <tbody className='migrated-file-table'>
                                <tr>
                                    <th
                                        style={{
                                            border: 'none',
                                            height: '3.5rem',
                                        }}
                                    ></th>
                                    <th>　</th>
                                    <th>設計書(登録先：設計・内訳書)</th>
                                    <th>完成明細書(登録先：設計・内訳書)</th>
                                    <th>契約書(登録先：契約登録)</th>
                                    <th>査定表(登録先：契約登録)</th>
                                    <th>稟議書(登録先：稟議)</th>
                                    <th>検査調書(登録先：建仮生産・除却)</th>
                                </tr>
                                {forms.map((form, index) => {
                                    if (index === 0) {
                                        return (
                                            <MigratedConstructionMotoSekkeiRow
                                                key={index}
                                                // IDが一番若いContractが元設計のContractである認識
                                                motoSekkeiContractForm={form}
                                                onChangeNewForm={newForm => {
                                                    setNewForm(newForm, 0);
                                                }}
                                            />
                                        );
                                    } else {
                                        return (
                                            <MigratedConstructionSekkeiHenkouRow
                                                key={index}
                                                contractForm={form}
                                                index={index}
                                                onChangeNewForm={newForm => {
                                                    setNewForm(newForm, index);
                                                }}
                                                onDeleteColumn={() => {
                                                    setForms(prevState => {
                                                        // 元のformsを壊さないため複製してからspliceで破壊的変更
                                                        const copiedForm =
                                                            prevState.slice();
                                                        copiedForm.splice(
                                                            index,
                                                            1,
                                                        );
                                                        return [...copiedForm];
                                                    });
                                                }}
                                                // 最後の列だけ削除ボタンが表示される
                                                isLastRow={
                                                    index + 1 === forms.length
                                                }
                                            />
                                        );
                                    }
                                })}
                                <AddColumnButton
                                    onAddColumn={() => addColumn()}
                                />
                            </tbody>
                        </Table>
                        <div>
                            <h6>工事管理シート(最終版)(登録先：基本情報)</h6>
                            <Form.File className='d-none'>
                                <Form.File.Input
                                    ref={inputRef}
                                    id='manage-sheet-upload'
                                    onChange={async (
                                        e: ChangeEvent<HTMLInputElement>,
                                    ) => {
                                        if (!e.target.files) return;
                                        const newForm: EditMigratedConstructionContractFileForm =
                                            {
                                                ...forms[0],
                                                manageSheetBase64:
                                                    await AttachmentService.convertBlobToBase64(
                                                        e.target.files[0],
                                                    ),
                                                manageSheetName:
                                                    e.target.files[0].name,
                                            };
                                        setNewForm(newForm, 0);
                                    }}
                                />
                            </Form.File>
                            <div
                                className='border w-50'
                                style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                <button
                                    className='p-2'
                                    style={{
                                        lineHeight: '1.5rem',
                                        border: 'none',
                                    }}
                                    onClick={() =>
                                        inputRef.current &&
                                        inputRef.current.click()
                                    }
                                >
                                    <FontAwesomeIcon icon={faUpload} />
                                    <span className='ml-2'>
                                        ファイルを選択してください
                                    </span>
                                </button>
                                <span className='mx-2'>{fileName()}</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </section>
            <SubmitModal
                onSubmit={() => onSubmit()}
                show={show}
                onHide={() => setShow(false)}
            />
        </Page>
    );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({
    params,
}) => {
    return {
        props: {
            constructionId: Number(params?.id),
        },
    };
};

export default MigratedConstructionDetailPage;
