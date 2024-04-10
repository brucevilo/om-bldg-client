import React, { FC, useContext, useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { MasterContext } from '../Context';

export const SupplierSelector: FC<{
    required?: boolean;
    onChange: (id: number) => void;
    value: string;
}> = props => {
    const { suppliers } = useContext(MasterContext);
    const [selectValue, setSelectValue] = useState<string>('');
    useEffect(() => {
        setSelectValue(
            suppliers.find(supplier => supplier.id === Number(props.value))
                ?.name || '',
        );
    }, [props.value, suppliers]);
    return (
        <Form.Group>
            <input
                className='form-control'
                required={props.required}
                autoComplete='on'
                list='selects'
                placeholder='検索'
                type='text'
                value={selectValue}
                onChange={e => {
                    setSelectValue(e.target.value);
                    const sameSupplier = suppliers.find(s => {
                        return s.name === e.target.value;
                    });
                    if (!sameSupplier) {
                        e.target.setCustomValidity('受注者が存在しません');
                    } else {
                        e.target.setCustomValidity('');
                        props.onChange(sameSupplier.id);
                    }
                }}
            />
            <datalist id='selects'>
                {suppliers.map(s => (
                    <option key={s.id}>{s.name}</option>
                ))}
            </datalist>
        </Form.Group>
    );
};
