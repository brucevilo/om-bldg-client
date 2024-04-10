import React, { FC, FormEvent, useState } from 'react';
import {
    Button,
    FormControl,
    FormGroup,
    FormLabel,
    Modal,
    ModalBody,
    ModalProps,
    Col,
    Form,
    Table,
} from 'react-bootstrap';
import { AssetStatement, Construction } from '@/Domain/Entity';
import {
    AssetStatementRepository,
    ConstructionRepository,
    ConstructionStatementRepository,
} from '@/Domain/Repository';
import { DateTime } from 'luxon';
import { uniqBy } from 'lodash';
import { assertsIsExists } from '@/Infrastructure';

type Props = ModalProps & {
    onHide: VoidFunction;
    setShowModal: () => void;
    parentAssetStatement: AssetStatement | undefined;
    setParentAssetStatement: React.Dispatch<
        React.SetStateAction<AssetStatement | undefined>
    >;
};

export const SearchAssetStatementModal: FC<Props> = ({
    onHide,
    setShowModal,
    parentAssetStatement,
    setParentAssetStatement,
    ...modalProps
}) => {
    const [assetStatements, setAssetStatements] = useState<AssetStatement[]>(
        [],
    );
    const [sapKey, setSapKey] = useState<string>('');
    const [searchStartAt, setSearchStartAt] = useState<string>('');
    const [searchEndAt, setSearchEndAt] = useState<string>('');
    const [assetName, setAssetName] = useState<string>('');
    const [
        constructionStatementIdsWithConstructions,
        setConstructionStatementIdsWithConstructions,
    ] = useState<
        { constructionStatementId: number; construction: Construction }[]
    >([]);
    const searchAssetStatements = async (e: FormEvent) => {
        e.preventDefault();
        const assetStatements = await AssetStatementRepository.search({
            sapKey: sapKey,
            startAt: searchStartAt,
            endAt: searchEndAt,
            name: assetName,
            isLatestContract: true,
        });
        setAssetStatements(assetStatements);
        const constructionStatementIds = uniqBy(
            assetStatements,
            'constructionStatementId',
        ).map(as => as.constructionStatementId);
        const constructionStatements =
            await ConstructionStatementRepository.mget(
                constructionStatementIds,
            );
        const contractIds = uniqBy(constructionStatements, 'contractId').map(
            cs => cs.contractId,
        );
        const constructions = await ConstructionRepository.mgetByContracts(
            contractIds,
        );
        const constructionStatementIdsWithConstructions =
            constructionStatements.map(constructionStatement => {
                const construction = constructions.find(
                    c =>
                        c.latestContract.id ===
                        constructionStatement.contractId,
                );
                assertsIsExists(
                    construction,
                    '対応するconstructionが存在しません',
                );
                return {
                    constructionStatementId: constructionStatement.id || 0,
                    construction: construction,
                };
            });
        setConstructionStatementIdsWithConstructions(
            constructionStatementIdsWithConstructions,
        );
    };
    const showCreateCostItemModal = () => {
        if (!parentAssetStatement) {
            alert('資産を選択してください');
            return;
        }
        onHide();
        setShowModal();
    };

    const SearchAssetStatementTr = (props: {
        assetStatement: AssetStatement;
    }) => {
        const { assetStatement } = props;
        const construction = constructionStatementIdsWithConstructions.find(
            cs =>
                cs.constructionStatementId ===
                assetStatement.constructionStatementId,
        )?.construction;
        return (
            <tr className='pb-4'>
                <td>
                    <Form.Check
                        id={String(assetStatement.id)}
                        onChange={() => setParentAssetStatement(assetStatement)}
                        checked={parentAssetStatement?.id === assetStatement.id}
                    />
                </td>
                <td>{assetStatement.name}</td>
                <td>{construction?.name || ''}</td>
                <td>
                    {assetStatement.sapRecordedAt &&
                        DateTime.fromJSDate(
                            assetStatement.sapRecordedAt,
                        ).toFormat('yyyy/MM/dd')}
                </td>
                <td>{assetStatement.sapRecordedPrice}</td>
            </tr>
        );
    };
    return (
        <Modal size='xl' onHide={() => onHide()} {...modalProps}>
            <Modal.Header>資産検索</Modal.Header>
            <ModalBody>
                <FormGroup>
                    <FormLabel>親資産</FormLabel>
                    <Form onSubmit={searchAssetStatements}>
                        <div className='position-relative'>
                            <FormGroup>
                                <FormLabel>取得日</FormLabel>
                                <div className='d-flex'>
                                    <Col xs='auto'>
                                        <FormControl
                                            type='date'
                                            value={searchStartAt || ''}
                                            onChange={e =>
                                                setSearchStartAt(e.target.value)
                                            }
                                            max='3000-12-31'
                                        />
                                    </Col>
                                    <Col xs='auto' className='text-center'>
                                        〜
                                    </Col>
                                    <Col xs='auto'>
                                        <FormControl
                                            type='date'
                                            value={searchEndAt || ''}
                                            onChange={e =>
                                                setSearchEndAt(e.target.value)
                                            }
                                            max='3000-12-31'
                                        />
                                    </Col>
                                    <Col xs='auto'>
                                        <Button
                                            variant='light'
                                            className='border bg-white'
                                            onClick={() => {
                                                setSearchStartAt('');
                                                setSearchEndAt('');
                                            }}
                                        >
                                            クリア
                                        </Button>
                                    </Col>
                                </div>
                            </FormGroup>
                            <div className='d-flex'>
                                <FormGroup as={Col}>
                                    <FormLabel>KEYコード</FormLabel>
                                    <FormControl
                                        value={sapKey}
                                        onChange={e =>
                                            setSapKey(e.target.value)
                                        }
                                        placeholder='KEYコードを入力して下さい。'
                                    />
                                </FormGroup>
                                <FormGroup as={Col}>
                                    <FormLabel>資産名称</FormLabel>
                                    <FormControl
                                        value={assetName}
                                        onChange={e =>
                                            setAssetName(e.target.value)
                                        }
                                        placeholder='資産名称を入力して下さい。'
                                    />
                                </FormGroup>
                            </div>
                            <div className='text-right'>
                                <Button
                                    type='submit'
                                    className='bg-white border mt-2'
                                    variant='light'
                                >
                                    検索する
                                </Button>
                            </div>
                        </div>
                    </Form>
                    {assetStatements.length !== 0 && (
                        <>
                            <Table hover className='mb-4'>
                                <thead>
                                    <tr>
                                        <td style={{ width: '40px' }}>
                                            <Form.Check
                                                checked={true}
                                                readOnly
                                            />
                                        </td>
                                        <td>資産名称</td>
                                        <td>工事名称</td>
                                        <td style={{ width: '124px' }}>
                                            取得日
                                        </td>
                                        <td style={{ width: '160px' }}>金額</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assetStatements.map(assetStatement => (
                                        <SearchAssetStatementTr
                                            key={assetStatement.id}
                                            assetStatement={assetStatement}
                                        />
                                    ))}
                                </tbody>
                            </Table>
                            <div className='text-right'>
                                <Button
                                    className='bg-white border mt-2'
                                    variant='light'
                                    onClick={() => showCreateCostItemModal()}
                                >
                                    確定する
                                </Button>
                            </div>
                        </>
                    )}
                </FormGroup>
            </ModalBody>
        </Modal>
    );
};
