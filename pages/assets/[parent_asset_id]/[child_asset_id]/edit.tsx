import React, { ChangeEventHandler, useEffect, useState } from 'react';
import { Page } from '@/Presentation/Component';
import { GetServerSideProps, NextPage } from 'next';
import { CostItem, CostItemTag } from '@/Domain/Entity';
import { CostItemRepository } from '@/Domain/Repository';
import { Badge, Button, Col, Form, Row, Navbar, Nav } from 'react-bootstrap';
import { useRouter } from 'next/router';
import {
    EditCostItem,
    EditCostItemForm,
    AttachmentService,
} from '@/App/Service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { assertsIsExists, getClient } from '@/Infrastructure';
import { AttachmentInfo } from '@/Domain/ValueObject';
import Styles from '@/Presentation/Style/Components/DeleteButton.module.scss';
import Link from 'next/link';

interface Props {
    costItemId: number;
    sapFixedAssetId: number;
}

const ChildAssetEdit: NextPage<Props> = ({ costItemId, sapFixedAssetId }) => {
    const router = useRouter();
    const [costItem, setCostItem] = useState<CostItem>();
    const [form, setForm] = useState<EditCostItemForm>();
    const [newTagName, setNewTagName] = useState<string>('');
    const [photos, setPhotos] = useState<AttachmentInfo[]>([]);

    const fetchData = async () => {
        const costItem = await CostItemRepository.get(costItemId);
        setCostItem(costItem);
        setForm(EditCostItem.costItemToForm(costItem));
        setPhotos(
            await Promise.all(
                costItem.photosInfo.map(async info => {
                    if (!info) assertsIsExists(info);
                    const res = await getClient().getFile(info.path);
                    const dataUrl =
                        await AttachmentService.convertBlobToDataUrl(res.data);
                    return {
                        path: dataUrl,
                        filename: info?.filename,
                    };
                }),
            ),
        );
    };

    useEffect(() => {
        fetchData();
    }, []);
    if (!costItem || !form) return null;
    const onChangeTag: React.KeyboardEventHandler<HTMLInputElement> = e => {
        if (e.key !== 'Enter') return;
        const newTag = new CostItemTag(
            null,
            costItemId,
            newTagName,
            new Date(),
            new Date(),
        );
        if (!form.costItemTags.some(tag => tag.name === newTag.name))
            setForm({
                ...form,
                costItemTags: form.costItemTags.concat(newTag),
            });
        e.preventDefault();
        setNewTagName('');
        return false;
    };
    const onChangePhoto: ChangeEventHandler<HTMLInputElement> = e => {
        const file = e.target.files && e.target.files[0];
        if (!file) assertsIsExists(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result as string;
            const newAttachmentInfo: AttachmentInfo = {
                path: dataUrl,
                filename: file.name,
            };
            setPhotos(photos.concat(newAttachmentInfo));
        };
        reader.readAsDataURL(file);
    };
    const onSubmit: React.FormEventHandler = async e => {
        e.preventDefault();
        const newCostItem = EditCostItem.formToCostItem(form);
        await CostItemRepository.update(newCostItem, photos);
        alert('更新が完了しました');
        router.push(`/assets/${sapFixedAssetId}/${costItemId}`);
    };
    return (
        <Page>
            <Navbar bg='white' className='px-5'>
                <Link
                    href={`/assets/${sapFixedAssetId}/${costItemId}`}
                    passHref
                >
                    <Nav.Link className='text-dark font-weight-bold mr-4'>
                        ←
                    </Nav.Link>
                </Link>
                <Navbar.Text>
                    <h5 className='text-dark font-weight-bold mb-0'>
                        <span className='mr-4'>{costItem.name}</span>
                    </h5>
                </Navbar.Text>
            </Navbar>
            <section>
                <Form onSubmit={onSubmit}>
                    <Form.Group as={Row}>
                        <Form.Label column sm={2}>
                            <Badge variant='secondary' className='mr-3'>
                                任意
                            </Badge>
                            <span className='font-weight-bold'>特定情報</span>
                        </Form.Label>
                        <Col sm={10}>
                            <Form.Control
                                placeholder='特定情報を入力し、Enterを押してください。'
                                value={newTagName}
                                onChange={e => setNewTagName(e.target.value)}
                                onKeyDown={onChangeTag}
                            />
                            <div className='d-flex'>
                                {form.costItemTags.map((tag, index) => (
                                    <Badge
                                        key={index}
                                        className='d-flex align-items-center mr-3'
                                        variant='info'
                                    >
                                        <div className='bg-secondary text-white p-2'>
                                            {tag.name}
                                        </div>
                                        <Button
                                            as='a'
                                            className='bg-white border-0'
                                            onClick={() =>
                                                setForm({
                                                    ...form,
                                                    costItemTags:
                                                        form.costItemTags.filter(
                                                            formTag =>
                                                                formTag.name !==
                                                                tag.name,
                                                        ),
                                                })
                                            }
                                        >
                                            <FontAwesomeIcon
                                                icon={faTimes}
                                                className='text-dark'
                                            />
                                        </Button>
                                    </Badge>
                                ))}
                            </div>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                        <Form.Label column sm={2}>
                            <Badge variant='secondary' className='mr-3'>
                                任意
                            </Badge>
                            <span className='font-weight-bold'>メモ</span>
                        </Form.Label>
                        <Col sm={10}>
                            <textarea
                                className='form-control'
                                value={form.memo}
                                onChange={e =>
                                    setForm({ ...form, memo: e.target.value })
                                }
                                placeholder='メモを入力してください。'
                                rows={6}
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                        <Form.Label column sm={2}>
                            <Badge variant='secondary' className='mr-3'>
                                任意
                            </Badge>
                            <span className='font-weight-bold'>画像</span>
                        </Form.Label>
                        <Col sm={10}>
                            <Form.File.Input
                                className='mb-3'
                                onChange={onChangePhoto}
                            />
                            <div className='d-flex'>
                                {photos.map((photo, index) => (
                                    <div
                                        key={index}
                                        className={`${Styles.image_wrapper} mr-3`}
                                    >
                                        <img
                                            src={photo?.path || ''}
                                            alt='photos'
                                            width={300}
                                            height={300}
                                        />
                                        <Button
                                            as='a'
                                            className={`${Styles.delete_button} bg-transparent border-0 p-0`}
                                            onClick={() => {
                                                if (!photo)
                                                    assertsIsExists(photo);
                                                setPhotos(
                                                    photos.filter(
                                                        p =>
                                                            p?.path !==
                                                            photo.path,
                                                    ),
                                                );
                                            }}
                                        >
                                            <FontAwesomeIcon
                                                icon={faTimesCircle}
                                                className='text-danger'
                                                size='2x'
                                            />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </Col>
                    </Form.Group>
                    <div className='d-flex justify-content-end'>
                        <Button
                            type='button'
                            variant='light'
                            className='bg-white border mr-4'
                            onClick={() =>
                                router.push(
                                    `/assets/${sapFixedAssetId}/${costItemId}`,
                                )
                            }
                        >
                            キャンセル
                        </Button>
                        <Button
                            type='submit'
                            variant='light'
                            className='bg-white border'
                        >
                            保存する
                        </Button>
                    </div>
                </Form>
            </section>
        </Page>
    );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({
    params,
}) => {
    return {
        props: {
            costItemId: Number(params?.child_asset_id),
            sapFixedAssetId: Number(params?.parent_asset_id),
        },
    };
};

export default ChildAssetEdit;
