import {
    CostItem,
    RetirementCostItem,
    CostItemRetirementStatus,
} from '@/Domain/Entity';
import React from 'react';
import { CostItemService } from '@/Domain/Service';
import { Badge } from 'react-bootstrap';

type Props = React.HTMLAttributes<HTMLDivElement> & {
    costItem: CostItem;
    retirementCostItems: RetirementCostItem[];
};

export const PartObRetirementBadge = (
    props: React.HTMLAttributes<HTMLDivElement>,
): JSX.Element => {
    return (
        <Badge
            className={`border border-danger text-danger bg-white ${
                props.className ? props.className : ''
            }`}
        >
            一部除却
        </Badge>
    );
};

export const DoneRetirementBadge = (
    props: React.HTMLAttributes<HTMLDivElement>,
): JSX.Element => {
    return (
        <Badge
            variant='danger'
            className={`${props.className ? props.className : ''}`}
        >
            除却
        </Badge>
    );
};

export const CostItemRetirementBadge: React.FC<Props> = ({
    costItem,
    retirementCostItems,
    ...props
}) => {
    switch (
        CostItemService.calcRetirementStatus(costItem, retirementCostItems)
    ) {
        case CostItemRetirementStatus.NotYet:
            return null;
        case CostItemRetirementStatus.PartOf:
            return <PartObRetirementBadge className={props.className} />;
        case CostItemRetirementStatus.Done:
            return <DoneRetirementBadge className={props.className} />;
        default:
            return null;
    }
};
