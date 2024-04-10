import React, { FC, useState } from 'react';
import { Form, FormControlProps } from 'react-bootstrap';

type FormControlElement =
    | HTMLInputElement
    | HTMLSelectElement
    | HTMLTextAreaElement;

export const DefferedFormControl: FC<
    FormControlProps & { placeholder?: string }
> = ({ value: initialValue, onChange, ...props }) => {
    const [event, setEvent] = useState<React.ChangeEvent<FormControlElement>>();
    const [value, setValue] = useState(initialValue);

    const onChangeInternal: React.ChangeEventHandler<
        FormControlElement
    > = e => {
        setEvent(e);
        setValue(e.target.value);
    };

    const onBlur = () => onChange && event && onChange(event);

    return (
        <Form.Control
            {...props}
            value={value}
            onChange={onChangeInternal}
            onBlur={onBlur}
        />
    );
};
