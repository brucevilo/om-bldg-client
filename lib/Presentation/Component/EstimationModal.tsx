import {
    AssetClass,
    AssetStatement,
    Construction,
    ConstructionStatement,
    Project,
    Contract,
    Building,
} from '@/Domain/Entity';
import {
    AssetClassRepository,
    AssetStatementRepository,
    ConstructionStatementRepository,
    ProjectRepository,
    BuildingRepository,
} from '@/Domain/Repository';
import { EstimationService, EstimationStatement } from '@/Domain/Service';
import { assertsIsExists, assertsIsNotNull } from '@/Infrastructure';
import { isNil } from 'lodash';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Estimation } from './Estimation';
import { EstimationResult } from './Estimation/types';
import { Loading } from './Loading';

interface Props {
    construction: Construction;
    costDocument: File;
    manageSheet: File;
    isDesignChange: boolean;
    show: boolean;
    onHide: () => void;
    onComplete: () => void;
    previousContract: Contract | null;
    isFirstContractChange: boolean;
    withinDesignChange: boolean; // 契約変更を積算と同時に行うか
}

export const EstimationModal: FC<Props> = ({
    construction,
    show,
    costDocument,
    manageSheet,
    isDesignChange,
    onHide,
    onComplete,
    previousContract,
    isFirstContractChange,
    withinDesignChange,
}) => {
    const [assetClasses, setAssetClasses] = useState<AssetClass[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [previousAssetStatements, setPreviousAssetStatements] = useState<
        AssetStatement[]
    >([]);
    const [previousConstructionStatements, setPreviousConstructionStatements] =
        useState<ConstructionStatement[]>([]);
    const [estimationStatements, setEstimationStatements] = useState<
        EstimationStatement[]
    >([]);
    const [estimationResult, setEstimationResult] =
        useState<EstimationResult>();

    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingEstimation, setIsLoadingEstimation] = useState(false);
    const [estimationErrors, setEstimationErrors] = useState<string[]>([]);
    const [lines, setLines] = useState<string[]>([]);
    const [buildingTypes, setBuildingTypes] = useState<string[]>([]);
    const [buildings, setBuildings] = useState<Array<Building>>([]);

    const fetchBuildingData = async (line = null, type = null) => {
        const buildingResponse = await BuildingRepository.getRawBuildings(
            line ? line : null,
            type ? type : null,
        );
        setBuildings(buildingResponse);
    };

    useEffect(() => {
        const fetchData = async () => {
            if (show && !isNil(construction.id) && costDocument) {
                const assetClasses = await AssetClassRepository.list();

                setAssetClasses(assetClasses);

                setProjects(
                    await ProjectRepository.listByConstruction(construction),
                );
                const estimationStatements =
                    await EstimationService.extractEstimationStatements(
                        await costDocument.arrayBuffer(),
                        assetClasses,
                        construction,
                        isDesignChange,
                    );
                setEstimationStatements(estimationStatements);

                const linesList = await BuildingRepository.getBuildingLines();
                const buildingTypesList =
                    await BuildingRepository.getBuildingTypes();
                setLines(linesList);
                setBuildingTypes(buildingTypesList);

                if (isDesignChange) {
                    assertsIsExists(previousContract);
                    setPreviousAssetStatements(
                        await AssetStatementRepository.listByConstruction(
                            construction.id,
                            previousContract.id,
                        ),
                    );

                    setPreviousConstructionStatements(
                        await ConstructionStatementRepository.listByConstruction(
                            construction.id,
                            previousContract.id,
                        ),
                    );
                }

                setIsLoading(false);
            }
        };

        fetchData();
        fetchBuildingData();
    }, [show, costDocument, construction, isDesignChange]);

    const onClickStore = useCallback(() => {
        setIsLoadingEstimation(true);
        if (estimationResult) {
            const func = async () => {
                assertsIsNotNull(construction.id);

                try {
                    await EstimationService.onConstructionEstimate({
                        constructionId: construction.id,
                        assetClasses,
                        costDocument,
                        manageSheet,
                        withinDesignChange,
                        ...estimationResult,
                    });
                    setIsLoadingEstimation(false);
                    onHide();
                    onComplete();
                } catch (e) {
                    console.error(e);
                    alert('積算登録処理中にエラーが発生しました');
                    location.reload();
                }
            };

            func();
        }
    }, [
        construction,
        assetClasses,
        costDocument,
        manageSheet,
        estimationResult,
        onComplete,
    ]);

    return (
        <Modal
            show={show}
            backdrop='static'
            onHide={onHide}
            dialogClassName='estimation-modal modal-90w'
        >
            <Modal.Header closeButton onHide={onHide}>
                <div className='w-100'>
                    積算登録
                    <Button
                        className='float-right'
                        disabled={
                            isNil(estimationResult) ||
                            estimationErrors.length !== 0 ||
                            isLoadingEstimation
                        }
                        onClick={onClickStore}
                    >
                        登録
                    </Button>
                </div>
            </Modal.Header>
            <Modal.Body className='bg-light'>
                {isLoading ? (
                    <Loading />
                ) : (
                    <Estimation
                        assetClasses={assetClasses}
                        construction={construction}
                        estimates={estimationStatements}
                        previousAssetStatements={previousAssetStatements}
                        previousConstructionStatements={
                            previousConstructionStatements
                        }
                        projects={projects}
                        isDesignChange={isDesignChange}
                        onChange={setEstimationResult}
                        setEstimationErrors={setEstimationErrors}
                        isFirstDesignChange={isFirstContractChange}
                        lines={lines}
                        buildings={buildings}
                        buildingTypes={buildingTypes}
                    />
                )}
            </Modal.Body>
        </Modal>
    );
};
