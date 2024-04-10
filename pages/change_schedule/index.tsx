import { NextPage } from 'next';
import { Page, ChangeScheduleRow } from '@/Presentation/Component';
import React, { useState, useEffect, FormEventHandler } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    ConstructionRepository,
    ConstructionStatementRepository,
    DesignRepository,
} from '@/Domain/Repository';
import {
    Construction,
    ConstructionStatement,
    ConstructionStatementHistory,
    ConstructionStatementHistoryFormValue,
    Design,
} from '@/Domain/Entity';
import { DateTime } from 'luxon';
import {
    assertsIsNotNegative,
    assertsIsNotNull,
    assertsIsNotNumeric,
} from '@/Infrastructure';
import { ChangeScheduleRowDesign } from '@/Presentation/Component/ChangeScheduleRowDesign';

const PlannedChange: NextPage = () => {
    const GRAY = 'c2c2c2';

    const [search, setSearch] = useState<string>('');
    const [constructions, setConstructions] = useState<Construction[]>([]);
    const [designs, setDesigns] = useState<Design[]>([]);
    const [constructionStatements, setConstructionStatements] = useState<
        ConstructionStatement[]
    >([]);
    const [isLoading, setIsLoading] = useState(false);
    const [
        constructionStatementsFormValues,
        setConstructionStatementsFormValues,
    ] = useState<ConstructionStatementHistoryFormValue[]>([]);
    const currentDate = DateTime.now();

    const fetchData = async () => {
        setIsLoading(true);
        const designResult = await DesignRepository.listByDIP();
        const result = await ConstructionRepository.listInProgressByKeyword(
            search,
        );
        const constructionStatementsResponse =
            await ConstructionStatementRepository.listByConstructions(
                result.map(c => c.id as number),
                true,
            );

        setDesigns(designResult);
        setConstructions(result);
        setConstructionStatements(constructionStatementsResponse);
        populateCsFormValues(constructionStatementsResponse);
        setIsLoading(false);
    };

    const populateCsFormValues = (
        constructionStatements: ConstructionStatement[],
    ) => {
        const newCsFormValues: ConstructionStatementHistoryFormValue[] =
            constructionStatements.map(cs => {
                // check if draft then display latest values
                const history: ConstructionStatementHistory | null =
                    cs.latestHistory();

                return {
                    ...(history?.isDraft && { id: history.id }),
                    constructionStatementId: cs?.id || 0,
                    assetDifference: history?.isDraft
                        ? history.assetDifference
                        : 0,
                    repairFeeDifference: history?.isDraft
                        ? history.repairFeeDifference
                        : 0,
                    removalFeeDifference: history?.isDraft
                        ? history.removalFeeDifference
                        : 0,
                    constructionPeriod: history?.isDraft
                        ? history.constructionPeriod
                        : null,
                    scheduledAcceptanceDate: history?.isDraft
                        ? history.scheduledAcceptanceDate
                        : null,
                    partialPayment: history?.isDraft
                        ? history.partialPayment
                        : 0,
                    partialPaymentAcceptanceDate: history?.isDraft
                        ? history.partialPaymentAcceptanceDate
                        : null,
                    reasonForChange: history?.isDraft
                        ? history.reasonForChange
                        : '',
                    file: null,
                    fileInfo: history?.isDraft ? history.fileInfo : null,
                    isUpdated: false,
                    isDraft: history?.isDraft ? true : false,
                };
            });
        setConstructionStatementsFormValues(newCsFormValues);
    };

    const handleCsFormValuesOnchange = (
        id: number,
        value: Partial<ConstructionStatementHistoryFormValue>,
    ) => {
        // copy new instance of array
        const csFormValues: ConstructionStatementHistoryFormValue[] = [
            ...constructionStatementsFormValues,
        ];
        // get index of target construction statement
        const index = csFormValues.findIndex(
            cs => cs.constructionStatementId === id,
        );

        // set new form value
        csFormValues[index] = {
            ...csFormValues[index],
            ...value,
            ...(!csFormValues[index].isUpdated && { isUpdated: true }),
        };
        setConstructionStatementsFormValues(csFormValues);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onSubmitSearch: FormEventHandler = e => {
        e.preventDefault();
        fetchData();
    };

    const getCsFormValueMessage = (
        id: number,
        field: string,
        type: string,
    ): string => {
        const name = constructionStatements.filter(cs => cs.id == id)[0].name;
        switch (type) {
            case 'required':
                return `${name} - (${field}) は、必須項目です。`;
            case 'nonnegative':
                return `${name} - (${field}) マイナスの値は入力できません`;
            case 'numeric':
                return `${name} - (${field}) 数値以外の値は入力できません`;
            default:
                return 'has error';
        }
    };

    const requiredFields = [
        { key: 'assetDifference', name: '資産（差分）' },
        { key: 'repairFeeDifference', name: '修繕費（差分）' },
        { key: 'removalFeeDifference', name: '撤去費（差分）' },
        { key: 'constructionPeriod', name: '工事工期' },
        { key: 'scheduledAcceptanceDate', name: '検収予定日' },
        { key: 'partialPayment', name: '出来高金額' },
        { key: 'partialPaymentAcceptanceDate', name: '出来高検収予定日' },
    ] as const;

    const numericFields = [
        'assetDifference',
        'repairFeeDifference',
        'removalFeeDifference',
        'partialPayment',
    ] as const;

    const onSubmitCsFormValues = async (isDraft: boolean) => {
        setIsLoading(true);

        // filter only cs that was changed
        const editedConstructionStatements =
            constructionStatementsFormValues.filter(
                cs => cs.isUpdated || cs.isDraft,
            );

        // check if all required fields are filled in
        try {
            if (editedConstructionStatements.length > 0) {
                editedConstructionStatements.map(csFormValues => {
                    requiredFields.map(item => {
                        assertsIsNotNull(
                            csFormValues[item.key],
                            getCsFormValueMessage(
                                csFormValues?.constructionStatementId || 0,
                                item.name,
                                'required',
                            ),
                        );

                        numericFields.map(numberField => {
                            assertsIsNotNegative(
                                csFormValues[numberField] || 0,
                                getCsFormValueMessage(
                                    csFormValues?.constructionStatementId || 0,
                                    numberField,
                                    'nonnegative',
                                ),
                            );
                            assertsIsNotNumeric(
                                csFormValues[numberField] || 0,
                                getCsFormValueMessage(
                                    csFormValues?.constructionStatementId || 0,
                                    numberField,
                                    'numeric',
                                ),
                            );
                        });
                    });
                });

                await ConstructionStatementRepository.updateScheduleChange(
                    editedConstructionStatements,
                    isDraft,
                ).then(() => {
                    const message = isDraft
                        ? '変更予定が下書き保存されました'
                        : '変更予定が登録されました';
                    alert(message);

                    fetchData();
                });
            }
        } catch (e) {
            if (e instanceof Error) {
                alert(e.message);
            } else {
                alert('エラーが発生しました。');
            }
        }

        setIsLoading(false);
    };

    return (
        <Page>
            <section className='d-flex flex-column min-vh-100'>
                <div className='d-flex flex-column'>
                    <h5 className='font-weight-bold'>
                        {currentDate.year}年{currentDate.month}月時点変更予定
                    </h5>
                    <p>
                        担当工事を確認し、設計内容に変更等がある場合は変更内容を登録してください。
                    </p>
                </div>
                <form onSubmit={onSubmitSearch}>
                    <Form.Group className='d-flex align-items-center'>
                        <Form.Control
                            className='w-100 form-control'
                            type='text'
                            placeholder='キーワードを入力してください。'
                            value={search}
                            onChange={e => {
                                setSearch(e.target.value);
                            }}
                        />
                        <FontAwesomeIcon
                            className='bg-white position-absolute'
                            style={{
                                right: '65px',
                                color: GRAY,
                                cursor: 'pointer',
                            }}
                            onClick={onSubmitSearch}
                            icon={faSearch}
                        />
                    </Form.Group>
                </form>
                {isLoading ? (
                    <div className='text-center my-4'>
                        <Spinner animation='border' role='status' />
                    </div>
                ) : (
                    <>
                        {constructions.map((construction, index) => (
                            <ChangeScheduleRow
                                key={index}
                                construction={construction}
                                constructionStatements={constructionStatements}
                                handleCsFormValuesOnchange={(
                                    id,
                                    value,
                                ) =>
                                    handleCsFormValuesOnchange(id, value)
                                }
                                constructionStatementsFormValues={
                                    constructionStatementsFormValues
                                }
                            />
                        ))}
                        {designs.map((design, index) => (
                            <ChangeScheduleRowDesign
                                key={index}
                                design={design}
                                constructionStatements={constructionStatements}
                                handleCsFormValuesOnchange={(
                                    id,
                                    value,
                                ) =>
                                    handleCsFormValuesOnchange(id,value)
                                }
                                constructionStatementsFormValues={
                                    constructionStatementsFormValues
                                }
                            />
                        ))}
                    </>

                )}
            </section>
            <div
                className='d-flex justify-content-end position-sticky py-3 pr-5 bg-white'
                style={{ bottom: '0', zIndex: 1 }}
            >
                <Button
                    variant='light'
                    className='bg-white border mr-3'
                    onClick={() => onSubmitCsFormValues(true)}
                    disabled={isLoading}
                >
                    下書き保存
                </Button>
                <Button
                    variant='light'
                    className='bg-primary text-white border'
                    onClick={() => onSubmitCsFormValues(false)}
                    disabled={isLoading}
                >
                    登録する
                </Button>
            </div>
        </Page>
    );
};
export default PlannedChange;
