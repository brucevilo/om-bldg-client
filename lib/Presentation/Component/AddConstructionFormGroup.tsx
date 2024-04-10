import React, { FC, KeyboardEventHandler, useState } from 'react';
import { EditConstructionForm } from '@/App/Service';
import { Badge, Button, Form } from 'react-bootstrap';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import Styles from '@/Presentation/Style/Components/EditConstructionFormCard.module.scss';
import { Design, Project } from '@/Domain/Entity';
import { uniq } from 'lodash';

interface Props {
    editForm: EditConstructionForm;
    onChange: (editForm: EditConstructionForm | null) => void;
    onSubmit: React.FormEventHandler;
    projects: Project[];
    design: Design;
}

export const AddConstructionFormGroup: FC<Props> = ({
    editForm,
    onChange,
    onSubmit,
    projects,
    design,
}) => {
    const [pjCode, setPjCode] = useState('');
    const onKeyPressPjCode: KeyboardEventHandler = e => {
        if (!['Enter', ' '].includes(e.key)) return;
        onChange({
            ...editForm,
            projectCodes: uniq([...editForm.projectCodes, pjCode]),
        });
        setPjCode('');
        e.preventDefault();
        e.stopPropagation();
    };
    const onFilterPjCode = (pjCode: string) => {
        onChange({
            ...editForm,
            projectCodes: editForm.projectCodes.filter(
                p => p.match(pjCode) === null,
            ),
        });
    };
    return (
        <div className='bg-light mb-4 p-4 position-relative rounded'>
            <button
                type='button'
                className={`${Styles.delete_icon} close`}
                aria-label='Close'
                onClick={() => onChange(null)}
            >
                <span aria-hidden='true'>
                    <FA icon={faTimesCircle} />
                </span>
            </button>
            <Form onSubmit={onSubmit}>
                <Form.Group>
                    <Form.Label htmlFor='disabledTextInput'>
                        通し番号
                    </Form.Label>
                    <Form.Control
                        value={design.documentNumber?.serialNumber || ''}
                        disabled
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label htmlFor='disabledTextInput'>
                        PJコード
                    </Form.Label>
                    <Form.Control
                        autoComplete='on'
                        list='projects'
                        placeholder='PJコードを選択してください。'
                        value={pjCode}
                        onChange={e => setPjCode(e.target.value)}
                        onKeyPress={onKeyPressPjCode}
                    />
                    <datalist id='projects'>
                        {projects.map(p => (
                            <option key={p.id}>{p.code}</option>
                        ))}
                    </datalist>
                    {editForm.projectCodes.map(t => (
                        <Badge key='t' variant='info' className='mr-2'>
                            {t}{' '}
                            <span
                                aria-hidden='true'
                                onClick={() => onFilterPjCode(t)}
                                style={{ cursor: 'pointer' }}
                            >
                                <FA icon={faTimesCircle} />
                            </span>
                        </Badge>
                    ))}
                </Form.Group>
                <Form.Group>
                    <Form.Label htmlFor='disabledTextInput'>工事名</Form.Label>
                    <Form.Control
                        required
                        placeholder='工事名を入力して下さい。'
                        value={editForm.name}
                        onChange={e =>
                            onChange({
                                ...editForm,
                                name: e.target.value,
                            })
                        }
                    />
                </Form.Group>
                <div className='text-right'>
                    <Button variant='info' type='submit'>
                        追加する
                    </Button>
                </div>
            </Form>
        </div>
    );
};
