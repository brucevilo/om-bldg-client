import React, { FC, FormEventHandler } from 'react';
import { Form, Row, Col, Badge, Button } from 'react-bootstrap';
import { EditProjectForm } from '@/App/Service';
import { NumberInput } from './NumberInput';
import { Project, ProjectClassification } from '@/Domain/Entity';
import { EnumToText } from '@/Infrastructure';

interface Props {
    onSubmit: FormEventHandler;
    editForm: EditProjectForm;
    onChange: (form: EditProjectForm) => void;
    projects: Project[];
}

export const EditProjectFormGroup: FC<Props> = ({
    onSubmit,
    editForm,
    onChange,
    projects,
}) => {
    const classificationChecks = Object.values(ProjectClassification).map(
        (classification, index) => {
            const classificationText =
                EnumToText.ProjectClassificationToText(classification);
            return (
                <Form.Check
                    key={index}
                    inline
                    label={classificationText}
                    type='radio'
                    id={classificationText}
                    checked={editForm.classification === classification}
                    onChange={() =>
                        onChange({
                            ...editForm,
                            classification: classification,
                        })
                    }
                />
            );
        },
    );
    const isUniqueProjectCode = () => {
        return projects.every(p => p.code !== editForm.code);
    };

    return (
        <form
            onSubmit={e => {
                e.preventDefault();
                if (!isUniqueProjectCode()) {
                    alert('同じ事業コードを持つ事業が既に存在しています');
                    return;
                }
                onSubmit(e);
            }}
        >
            <Form.Group as={Row}>
                <Form.Label column sm='3'>
                    <Badge variant='danger' className='mr-3'>
                        必須
                    </Badge>
                    <span className='font-weight-bold'>PJコード</span>
                </Form.Label>
                <Col sm='9'>
                    <input
                        className='form-control'
                        value={editForm.code}
                        required
                        onChange={e =>
                            onChange({
                                ...editForm,
                                code: e.target.value,
                            })
                        }
                        placeholder='PJコードを入力してください。'
                    />
                </Col>
            </Form.Group>
            <Form.Group as={Row}>
                <Form.Label column sm='3'>
                    <Badge variant='danger' className='mr-3'>
                        必須
                    </Badge>
                    <span className='font-weight-bold'>事業名</span>
                </Form.Label>
                <Col sm='9'>
                    <input
                        className='form-control'
                        value={editForm.name}
                        required
                        onChange={e =>
                            onChange({
                                ...editForm,
                                name: e.target.value,
                            })
                        }
                        placeholder='事業名を入力してください。'
                    />
                </Col>
            </Form.Group>
            <Form.Group as={Row}>
                <Form.Label column sm='3'>
                    <Badge variant='danger' className='mr-3'>
                        必須
                    </Badge>
                    <span className='font-weight-bold'>事業種別</span>
                </Form.Label>
                <Col sm='9'>{classificationChecks}</Col>
            </Form.Group>
            <Form.Group as={Row}>
                <Form.Label column sm='3'>
                    <Badge variant='danger' className='mr-3'>
                        必須
                    </Badge>
                    <span className='font-weight-bold'>予算</span>
                </Form.Label>
                <Col sm='9'>
                    <NumberInput
                        value={editForm.budget}
                        required
                        className='form-control'
                        onChange={budget =>
                            onChange({
                                ...editForm,
                                budget,
                            })
                        }
                    />
                </Col>
            </Form.Group>
            <Form.Group as={Row}>
                <Form.Label column sm='3'>
                    <Badge variant='danger' className='mr-3'>
                        必須
                    </Badge>
                    <span className='font-weight-bold'>企画書/WBS</span>
                </Form.Label>
                <Col sm='9'>
                    {editForm.fileInfo?.path && (
                        <a
                            className='d-block my-2'
                            target='__blank'
                            href={
                                process.env.NEXT_PUBLIC_API_ORIGIN +
                                editForm.fileInfo.path
                            }
                        >
                            添付済み
                        </a>
                    )}
                    <input
                        type='file'
                        onChange={e =>
                            onChange({
                                ...editForm,
                                file: e.target.files ? e.target.files[0] : null,
                            })
                        }
                        className='form-control-file'
                    />
                </Col>
            </Form.Group>
            <Form.Group as={Row}>
                <Form.Label column sm='3'>
                    <Badge variant='secondary' className='mr-3'>
                        任意
                    </Badge>
                    <span className='font-weight-bold'>メモ</span>
                </Form.Label>
                <Col sm='9'>
                    <textarea
                        className='form-control'
                        value={editForm.note}
                        onChange={e =>
                            onChange({
                                ...editForm,
                                note: e.target.value,
                            })
                        }
                        placeholder='メモを入力してください。'
                    />
                </Col>
            </Form.Group>
            <div className='text-right'>
                <Button type='submit'>登録</Button>
            </div>
        </form>
    );
};
