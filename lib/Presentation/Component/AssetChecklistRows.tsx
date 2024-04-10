import {
    AssetChecklist,
    AssetStatement,
    ConstructionStatement,
    CostItem,
    RetirementCostItem,
    SapFixedAsset,
    Contract,
} from '@/Domain/Entity';
import { DateTime } from 'luxon';
import React, { FC, Fragment, useState } from 'react';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import {
    faChevronDown,
    faChevronRight,
    faEllipsisH,
} from '@fortawesome/free-solid-svg-icons';
import { Badge, Button, Form, Dropdown } from 'react-bootstrap';
import { AssetCheckTermService } from '@/App/Service';
import { CostItemService } from '@/Domain/Service';
import Link from 'next/link';
import { CostItemRetirementBadge } from '@/Presentation/Component';

type CostItemGroup = {
    sapFixedAsset: SapFixedAsset;
    costItems: CostItem[];
};

interface Props {
    sapFixedAssets: SapFixedAsset[];
    assetStatements: AssetStatement[];
    constructionStatements: ConstructionStatement[];
    checkCostItemGroups: CostItemGroup[];
    retirementCostItems: RetirementCostItem[];
    contracts: Contract[];
    setCheckCostItemGroups: (costItemGroup: CostItemGroup[]) => void;
}

const CustomToggle = React.forwardRef(
    (
        props: {
            onClick: (
                event: React.MouseEvent<HTMLSpanElement, MouseEvent>,
            ) => void;
        },
        ref: React.Ref<HTMLSpanElement>,
    ) => (
        <span
            ref={ref}
            style={{ cursor: 'pointer' }}
            onClick={e => {
                e.preventDefault();
                props.onClick(e);
            }}
        >
            <FA icon={faEllipsisH} />
        </span>
    ),
);
CustomToggle.displayName = 'CustomToggle';

export const AssetChecklistRows: FC<Props> = ({
    sapFixedAssets,
    assetStatements,
    constructionStatements,
    checkCostItemGroups,
    retirementCostItems,
    contracts,
    setCheckCostItemGroups,
}) => {
    const [showSapFixedAssetIds, setShowSapFixedAssetIds] = useState<number[]>(
        [],
    );

    const sapFixedAssetRows = sapFixedAssets.map(sapFixedAsset => {
        const relatedAssetStatements = assetStatements.filter(
            as => as.sapFixedAssetId === sapFixedAsset.id,
        );
        const relatedConstructionStatements = constructionStatements.filter(
            cs =>
                relatedAssetStatements.some(
                    as => as.constructionStatementId === cs.id,
                ),
        );
        const relatedCostItems = relatedConstructionStatements.flatMap(
            constructionStatement =>
                constructionStatement.costItems.filter(
                    item => item.assetClass?.accountDivision !== '費用',
                ),
        );
        const isCheckedInTerm = (assetChecklists: AssetChecklist[]) => {
            return assetChecklists.some(checkklist =>
                AssetCheckTermService.getCheckTerm().contains(
                    DateTime.fromJSDate(checkklist.createdAt),
                ),
            );
        };
        const checkAllRelatedCostItems = () => {
            const isChecked = checkCostItemGroups.some(
                group => group.sapFixedAsset.id === sapFixedAsset.id,
            );
            if (isChecked) {
                setCheckCostItemGroups(
                    checkCostItemGroups.filter(
                        group => group.sapFixedAsset.id !== sapFixedAsset.id,
                    ),
                );
            } else {
                if (relatedCostItems.length === 0)
                    return setCheckCostItemGroups(
                        checkCostItemGroups.concat({
                            sapFixedAsset: sapFixedAsset,
                            costItems: [],
                        }),
                    );
                const newCostItems = relatedCostItems.filter(
                    item => !isCheckedInTerm(item.assetChecklists),
                );
                setCheckCostItemGroups(
                    checkCostItemGroups.concat({
                        sapFixedAsset: sapFixedAsset,
                        costItems: newCostItems,
                    }),
                );
            }
        };
        const checkCostItem = (costItem: CostItem) => {
            const isRelatedCostItemChecked = checkCostItemGroups.some(
                group => group.sapFixedAsset.id === sapFixedAsset.id,
            );
            if (isRelatedCostItemChecked) {
                setCheckCostItemGroups(
                    checkCostItemGroups.map(group => {
                        if (group.sapFixedAsset.id !== sapFixedAsset.id)
                            return group;
                        return {
                            sapFixedAsset: group.sapFixedAsset,
                            costItems: group.costItems.some(
                                ci => ci.id === costItem.id,
                            )
                                ? group.costItems.filter(
                                      ci => ci.id !== costItem.id,
                                  )
                                : [...group.costItems, costItem],
                        };
                    }),
                );
            } else {
                setCheckCostItemGroups(
                    checkCostItemGroups.concat({
                        sapFixedAsset,
                        costItems: [costItem],
                    }),
                );
            }
        };
        const isShowAssetStatementDetail =
            sapFixedAsset.id && showSapFixedAssetIds.includes(sapFixedAsset.id);
        const sortByAssetChecklistCreatedAt = (
            assetChecklists: AssetChecklist[],
        ) =>
            assetChecklists
                .flatMap(c => c.createdAt)
                .sort((a: Date, b: Date) => b.getTime() - a.getTime());
        const isChecked = (costItem: CostItem) => {
            const costItemGroup = checkCostItemGroups.find(
                group => group.sapFixedAsset.id === sapFixedAsset.id,
            );
            if (!costItemGroup) return false;
            const isAlreadyChecked = costItemGroup.costItems.includes(costItem);
            if (isAlreadyChecked) return true;
        };
        const isParentAssetChecked = () => {
            return (
                relatedCostItems.length !== 0 &&
                relatedCostItems.every(item =>
                    isCheckedInTerm(item.assetChecklists),
                )
            );
        };
        const dateToFormat = (date: Date) =>
            DateTime.fromJSDate(date).toFormat('yyyy/MM/dd');
        const parentAssetCheckDate = () =>
            sapFixedAsset.assetChecklists.length === 0
                ? ''
                : dateToFormat(
                      sortByAssetChecklistCreatedAt(
                          sapFixedAsset.assetChecklists,
                      )[0],
                  );
        const relatedContract = contracts.find(
            c =>
                relatedConstructionStatements.length > 0 &&
                c.id === relatedConstructionStatements[0].contractId,
        );

        return (
            <Fragment key={sapFixedAsset.id}>
                <tr>
                    <td className='text-center'>
                        {relatedCostItems.length === 0 || (
                            <Button
                                className='btn border-0 bg-transparent'
                                onClick={() =>
                                    setShowSapFixedAssetIds(
                                        isShowAssetStatementDetail
                                            ? showSapFixedAssetIds.filter(
                                                  id => id !== sapFixedAsset.id,
                                              )
                                            : showSapFixedAssetIds.concat(
                                                  sapFixedAsset.id || 0,
                                              ),
                                    )
                                }
                            >
                                {isShowAssetStatementDetail ? (
                                    <FA
                                        icon={faChevronDown}
                                        className='text-primary'
                                        size='2x'
                                    />
                                ) : (
                                    <FA
                                        icon={faChevronRight}
                                        className='text-primary'
                                        size='2x'
                                    />
                                )}
                            </Button>
                        )}
                    </td>
                    <td className='text-center'>
                        <Form.Check
                            onChange={() => checkAllRelatedCostItems()}
                            checked={
                                checkCostItemGroups.some(
                                    group =>
                                        group.sapFixedAsset.id ===
                                        sapFixedAsset.id,
                                ) ||
                                isParentAssetChecked() ||
                                isCheckedInTerm(sapFixedAsset.assetChecklists)
                            }
                            disabled={
                                isParentAssetChecked() ||
                                isCheckedInTerm(sapFixedAsset.assetChecklists)
                            }
                        />
                    </td>
                    <td>{sapFixedAsset.key || '---'}</td>
                    <td title={sapFixedAsset.assetName}>
                        <Link
                            href='/assets/[parent_assets]/summary'
                            as={`/assets/${sapFixedAsset.id}/summary`}
                            passHref
                        >
                            {sapFixedAsset.assetName}
                        </Link>
                    </td>
                    <td />
                    <td />
                    <td />
                    <td title={sapFixedAsset.assetText}>
                        {sapFixedAsset.assetText}
                    </td>
                    <td title={parentAssetCheckDate()}>
                        {parentAssetCheckDate()}
                    </td>
                    <td title={dateToFormat(sapFixedAsset.recordedAt)}>
                        {dateToFormat(sapFixedAsset.recordedAt)}
                    </td>
                    <td
                        title={
                            sapFixedAsset.termEndPrice.toLocaleString() || '---'
                        }
                    >
                        {sapFixedAsset.termEndPrice.toLocaleString() || '---'}
                    </td>
                </tr>
                {isShowAssetStatementDetail &&
                    relatedCostItems.map(item => {
                        const notRetirementAmount =
                            CostItemService.calcNotRetirementAmount(
                                item,
                                retirementCostItems,
                            );
                        return (
                            <tr
                                key={item.id}
                                style={{ backgroundColor: '#E9F0FB' }}
                            >
                                <td />
                                <td>
                                    <Form.Check
                                        onChange={() => checkCostItem(item)}
                                        checked={
                                            isCheckedInTerm(
                                                item.assetChecklists,
                                            ) || isChecked(item)
                                        }
                                        disabled={isCheckedInTerm(
                                            item.assetChecklists,
                                        )}
                                    />
                                </td>
                                <td />
                                <td title={item.name}>
                                    <Link
                                        href='/assets/[parent_assets]/[child_assets]'
                                        as={`/assets/${sapFixedAsset.id}/${item.id}`}
                                        passHref
                                    >
                                        <>
                                            <CostItemRetirementBadge
                                                className='mr-2 rounded-pill px-2'
                                                costItem={item}
                                                retirementCostItems={
                                                    retirementCostItems
                                                }
                                            />
                                            {item.name}
                                        </>
                                    </Link>
                                </td>
                                <td className='d-flex'>
                                    {item.costItemTags.map(tag => (
                                        <Badge
                                            key={tag.id}
                                            variant='info'
                                            className='mr-1'
                                        >
                                            {tag.name}
                                        </Badge>
                                    ))}
                                </td>
                                <td>{item.amount}</td>
                                <td>{notRetirementAmount}</td>
                                <td title={sapFixedAsset.assetText}>
                                    {sapFixedAsset.assetText}
                                </td>
                                <td>
                                    {item.assetChecklists.length !== 0
                                        ? dateToFormat(
                                              sortByAssetChecklistCreatedAt(
                                                  item.assetChecklists,
                                              )[0],
                                          )
                                        : ''}
                                </td>
                                <td
                                    title={dateToFormat(
                                        sapFixedAsset.recordedAt,
                                    )}
                                >
                                    {dateToFormat(sapFixedAsset.recordedAt)}
                                </td>
                                <td>
                                    <Dropdown className='position-static'>
                                        <Dropdown.Toggle as={CustomToggle} />
                                        <Dropdown.Menu>
                                            <Dropdown.Item>
                                                詳細情報を追加する（@TODO）
                                            </Dropdown.Item>
                                            <Dropdown.Item
                                                disabled={
                                                    notRetirementAmount === 0
                                                }
                                                href={`/constructions/${
                                                    relatedContract &&
                                                    relatedContract.constructionId
                                                }/retirement/adjust?costItemIds=${
                                                    item.id
                                                }`}
                                            >
                                                除却する
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </td>
                            </tr>
                        );
                    })}
            </Fragment>
        );
    });
    return <>{sapFixedAssetRows}</>;
};
