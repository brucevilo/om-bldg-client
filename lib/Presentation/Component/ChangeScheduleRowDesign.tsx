import React, { useState, FC } from 'react';
import {
    Card,
    ListGroup,
    ToggleButton,
    ToggleButtonGroup,
} from 'react-bootstrap';
import {
    Design,
    ConstructionStatement,
    ConstructionStatementHistoryFormValue,
} from '@/Domain/Entity';

interface Props {
    design: Design;
    constructionStatements: ConstructionStatement[];
    handleCsFormValuesOnchange: (
        id: number,
        value: Partial<ConstructionStatementHistoryFormValue>,
    ) => void;
    constructionStatementsFormValues: ConstructionStatementHistoryFormValue[];
}

export const ChangeScheduleRowDesign: FC<Props> = ({ design }) => {
    const [selected, setSelected] = useState(false);

    const handleDesignClick = (id: number | null, value: string) => {
        if (!id) return;
        setSelected(value === 'true');
    };

    return (
        <Card key={design.id} className='w-100 mb-4'>
            <ListGroup variant='flush'>
                <ListGroup.Item className='font-weight-bold'>
                    <div className='d-flex justify-content-between'>
                        <div className='text-info'>{design.name}</div>
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
                                        handleDesignClick(
                                            design.id,
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
            </ListGroup>
        </Card>
    );
};
