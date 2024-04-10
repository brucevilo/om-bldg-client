import React, {
    ChangeEventHandler,
    FC,
    KeyboardEventHandler,
    HTMLProps,
    useState,
} from 'react';

export interface Props
    extends Omit<
        HTMLProps<HTMLInputElement>,
        'value' | 'type' | 'pattern' | 'onChange' | 'onKeyUp'
    > {
    value: string;
    onChange: (value: string) => void;
}

export const NumberInput: FC<Props> = props => {
    const { value, onChange, max, ...defaultProps } = props;
    const removeComma = (str: string) => str.replace(/,/g, '');
    const [text, setText] = useState(
        value && Number(removeComma(value)).toLocaleString(),
    );
    const onChangeInput: ChangeEventHandler<HTMLInputElement> = e => {
        setText(e.target.value);
    };
    const onKeyUpInput: KeyboardEventHandler<HTMLInputElement> = e => {
        const textWithoutComma = removeComma(text);
        onChange(textWithoutComma);
        const num = Number(textWithoutComma);
        if (max && num > max) {
            e.currentTarget.setCustomValidity(
                `${max}以下の値を入力してください`,
            );
        } else {
            e.currentTarget.setCustomValidity('');
        }
        const newText = num ? num.toLocaleString() : textWithoutComma;
        setText(newText);
    };
    return (
        <input
            {...defaultProps}
            value={text}
            type='text'
            pattern='^[0-9,]*$'
            onChange={onChangeInput}
            onKeyUp={onKeyUpInput}
            placeholder='0'
        />
    );
};
