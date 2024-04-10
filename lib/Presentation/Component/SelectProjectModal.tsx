import React, { FC, useState, useEffect } from 'react';
import { Modal, ModalProps, Form, Button } from 'react-bootstrap';
import { Project } from '@/Domain/Entity';
import { ProjectRepository } from '@/Domain/Repository';

export const SelectProjectModal: FC<
    ModalProps & {
        onSelectProject: (projectId: number) => void;
        title?: string;
    }
> = props => {
    const [projectQuery, setProjectQuery] = useState('');
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        ProjectRepository.index().then(setProjects);
    }, []);

    const { onSelectProject, title, ...modalProps } = props;

    const onSubmit = () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [projectId, ...other] = projectQuery.split(':');
        const project = projects.find(p => p.id === Number(projectId));
        if (!project) return alert('指定されたプロジェクトが存在しません');
        onSelectProject(project.id as number);
    };

    return (
        <Modal {...modalProps}>
            <Modal.Header closeButton>
                <Modal.Title>{title || '設計登録'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group>
                    <Form.Label>事業</Form.Label>
                    <input
                        className='form-control'
                        required
                        autoComplete='on'
                        list='projects'
                        placeholder='事業を選択してください'
                        type='text'
                        value={projectQuery}
                        onChange={e => setProjectQuery(e.target.value)}
                    />
                    <datalist id='projects'>
                        {projects.map(p => (
                            <option key={p.id}>
                                {p.id}:{p.name}
                            </option>
                        ))}
                    </datalist>
                </Form.Group>
                <Button onClick={onSubmit}>選択</Button>
            </Modal.Body>
        </Modal>
    );
};
