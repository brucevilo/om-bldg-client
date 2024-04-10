import React, { FC, useState } from 'react';
import { NumberInput, Props } from './NumberInput';

export const DefferedNumberInput: FC<Props> = ({
    onChange,
    value: initialValue,
    ...props
}) => {
    const [value, setValue] = useState(initialValue);
    const onBlur = () => onChange && onChange(value);
    return (
        <NumberInput
            {...props}
            value={value}
            onChange={setValue}
            onBlur={onBlur}
        />
    );
};
