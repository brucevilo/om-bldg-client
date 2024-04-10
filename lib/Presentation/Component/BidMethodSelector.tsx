import React, { ChangeEventHandler, FC } from 'react';
import { Form } from 'react-bootstrap';

export const BidMethodSelector: FC<{
    required?: boolean;
    onChange: ChangeEventHandler<HTMLSelectElement>;
    value: string;
}> = props => {
    const bidMethod = ['一般競争入札', '指名競争入札', '指定契約'];
    return (
        <Form.Control as='select' {...props}>
            <option value=''>選択してください</option>
            {bidMethod.map(e => (
                <option key={e} value={e}>
                    {e}
                </option>
            ))}
        </Form.Control>
    );
};
