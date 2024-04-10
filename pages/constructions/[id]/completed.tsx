import { Page, ConstructionTabWrapper } from '@/Presentation/Component';
import { NextPage, GetServerSideProps } from 'next';
import React, { useState, useEffect, useContext } from 'react';
import { Construction } from '@/Domain/Entity';
import { ConstructionRepository } from '@/Domain/Repository';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { DateTime } from 'luxon';
import { MasterContext } from '@/Presentation/Context';
import ConstructionHeaderBreadcrumb from '@/Presentation/Component/ConstructionHeaderBreadcrumb';
import { ContractNextActionNumber } from '@/App/Service/ContractNextActionToNumber';
import { MigratedConstructionCompleted } from '@/Presentation/Component/MigratedConstruction/MigratedConstructionCompleted';

interface Props {
    id: number;
}
interface State {
    construction: Construction;
}

const ConstructionCompleted: NextPage<Props> = ({ id }) => {
    const [state, setState] = useState<State>();
    const [displayDeleteButton, setDisplayDeleteButton] =
        useState<boolean>(false);
    const fetchData = async () => {
        const construction = await ConstructionRepository.get(id);
        setState({
            construction,
        });
    };
    const { users } = useContext(MasterContext);

    useEffect(() => {
        fetchData();
    }, []);

    if (!state) return null;

    const { construction } = state;
    const contract = construction.latestContract;

    if (construction.madeByMigration) {
        return (
            <Page>
                <section>
                    <ConstructionHeaderBreadcrumb
                        construction={construction}
                        displayDeleteButton={() =>
                            setDisplayDeleteButton(!displayDeleteButton)
                        }
                    />
                    <ConstructionTabWrapper
                        id={id}
                        construction={construction}
                        displayDeleteButton={displayDeleteButton}
                    />
                    <MigratedConstructionCompleted />
                </section>
            </Page>
        );
    }

    if (
        ContractNextActionNumber[contract.nextAction] <
        ContractNextActionNumber.completed
    ) {
        return (
            <Page>
                <section>
                    <ConstructionHeaderBreadcrumb
                        construction={construction}
                        displayDeleteButton={() =>
                            setDisplayDeleteButton(!displayDeleteButton)
                        }
                    />
                    <ConstructionTabWrapper
                        id={id}
                        construction={construction}
                        displayDeleteButton={displayDeleteButton}
                    />
                    <Card>
                        <Card.Body>
                            <div className='d-flex justify-content-between'>
                                <span>工事が完了していません</span>
                            </div>
                        </Card.Body>
                    </Card>
                </section>
            </Page>
        );
    }
    return (
        <Page>
            <section>
                <ConstructionHeaderBreadcrumb
                    construction={construction}
                    displayDeleteButton={() =>
                        setDisplayDeleteButton(!displayDeleteButton)
                    }
                />
                <ConstructionTabWrapper
                    id={id}
                    construction={construction}
                    displayDeleteButton={displayDeleteButton}
                />
                <Container fluid>
                    <Row>
                        <Col sm='3' className='font-weight-bold border p-3'>
                            工事完了日付
                        </Col>
                        <Col
                            sm='9'
                            className='border p-3 bg-white d-flex justify-content-between'
                        >
                            {contract.completedAt &&
                                DateTime.fromJSDate(
                                    contract.completedAt,
                                ).toFormat('yyyy年MM月dd日')}
                        </Col>
                    </Row>
                    <Row>
                        <Col sm='3' className='font-weight-bold border p-3'>
                            処理担当者
                        </Col>
                        <Col sm='9' className='border p-3 bg-white'>
                            {
                                users.find(u => u.id === contract.completedById)
                                    ?.name
                            }
                        </Col>
                    </Row>
                </Container>
            </section>
        </Page>
    );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({
    params,
}) => {
    return {
        props: {
            id: Number(params?.id),
        },
    };
};

export default ConstructionCompleted;
