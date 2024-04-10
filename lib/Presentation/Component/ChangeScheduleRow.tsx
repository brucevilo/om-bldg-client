import React, { useState, FC } from 'react';
import {
    Card,
    ListGroup,
    ToggleButton,
    ToggleButtonGroup,
} from 'react-bootstrap';
import {
    Construction,
    ConstructionStatement,
    ConstructionStatementHistoryFormValue,
    Contract,
} from '@/Domain/Entity';
import ChangeScheduleConstructionStatementRow from './ChangeScheduleConstructionStatementRow';

interface Props {
    construction: Construction;
    constructionStatements: ConstructionStatement[];
    handleCsFormValuesOnchange: (
        id: number,
        value: Partial<ConstructionStatementHistoryFormValue>,
    ) => void;
    constructionStatementsFormValues: ConstructionStatementHistoryFormValue[];
}

export const ChangeScheduleRow: FC<Props> = ({
    construction,
    constructionStatements,
    handleCsFormValuesOnchange,
    constructionStatementsFormValues,
}) => {
    const [selected, setSelected] = useState(false);

    const handleConstructionClick = (id: number | null, value: string) => {
        if (!id) return;
        setSelected(value === 'true');
    };

    const filterConstructionStatementsByContractId = (id: number) => {
        return constructionStatements.filter(cs => cs.contractId == id);
    };

    const getConstructionStatementForm = (
        id: number,
    ): ConstructionStatementHistoryFormValue => {
        return constructionStatementsFormValues.filter(
            csFormValue => csFormValue.constructionStatementId === id,
        )[0];
    };

    return (
        <Card key={construction.id} className='w-100 mb-4'>
            <ListGroup variant='flush'>
                <ListGroup.Item className='font-weight-bold'>
                    <div className='d-flex justify-content-between'>
                        <div className='text-info'>{construction.name}</div>
                        <ToggleButtonGroup type='radio' name='radio'>
                            {[
                                { label: '変更なし', value: false },
                                { label: '変更あり', value: true },
                            ].map((radio, index) => (
                                <ToggleButton
                                    key={index}
                                    id={`radio-${index}`}
                                    variant={
                                        selected == radio.value
                                            ? 'btn bg-primary text-white'
                                            : 'btn border'
                                    }
                                    name='radio'
                                    value={String(radio.value)}
                                    onChange={e =>
                                        handleConstructionClick(
                                            construction.id,
                                            e.target.value,
                                        )
                                    }
                                >
                                    {radio.label}
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </div>
                </ListGroup.Item>
                {selected
                    ? construction.contracts.map((c: Contract) => {
                          return filterConstructionStatementsByContractId(
                              c.id,
                          ).map(cs => (
                              <ChangeScheduleConstructionStatementRow
                                  key={cs.id}
                                  constructionStatement={cs}
                                  contract={c}
                                  constructionStatementFormValue={getConstructionStatementForm(
                                      cs?.id || 0,
                                  )}
                                  handleCsFormValuesOnchange={(id, field) =>
                                      handleCsFormValuesOnchange(id, field)
                                  }
                              />
                          ));
                      })
                    : null}
            </ListGroup>
        </Card>
    );
};
