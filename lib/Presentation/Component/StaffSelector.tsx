import React, { FC, useContext, useState } from 'react';
import { useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { MasterContext } from '../Context';

export const StaffSelector: FC<{
    required?: boolean;
    onChange: (id: number) => void;
    value: string;
}> = props => {
    const { users } = useContext(MasterContext);
    const [selectValue, setSelectValue] = useState<string>('');
    useEffect(() => {
        setSelectValue(
            users.find(user => user.id === Number(props.value))?.name || '',
        );
    }, [props.value, users]);
    return (
        <Form.Group>
            <input
                className='form-control'
                required={props.required}
                autoComplete='on'
                list='users'
                placeholder='検索'
                type='text'
                value={selectValue}
                onChange={(
                    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
                ) => {
                    setSelectValue(e.target.value);
                    const sameUser = users.find(u => u.name === e.target.value);
                    if (!sameUser) {
                        e.target.setCustomValidity('ユーザが存在しません');
                    } else {
                        e.target.setCustomValidity('');
                        props.onChange(sameUser.id);
                    }
                }}
            />
            <datalist id='users'>
                {users.map(u => (
                    <option key={u.id}>{u.name}</option>
                ))}
            </datalist>
        </Form.Group>
    );
};
