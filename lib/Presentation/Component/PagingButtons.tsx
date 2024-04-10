import React, { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { buttonPositions } from '@/App/Service';
import { ChecklistGroup } from '@/Domain/ValueObject';

const createPagingButtons = (
    totalPages: number,
    pageNum: number,
    setPageNum: (num: number) => void,
    checklistGroups?: ChecklistGroup[],
) => {
    const { firstButton, middleButtons, lastButton } = buttonPositions(
        totalPages,
        pageNum,
    );
    const buttons = [];
    const onTmpSave = () => {
        localStorage.setItem(
            'checklist_groups',
            JSON.stringify(checklistGroups),
        );
    };
    if (firstButton) {
        buttons.push(
            <Button
                className='mr-2'
                key={1}
                onClick={() => {
                    checklistGroups && onTmpSave();
                    setPageNum(1);
                }}
                variant='outline-info'
            >
                {1}
            </Button>,
        );
        buttons.push(
            <label
                key={`first-separate-${pageNum}`}
                className='mr-2'
                style={{ padding: '0.375rem 0.75rem' }}
            >
                ...
            </label>,
        );
    }
    middleButtons.forEach(i =>
        buttons.push(
            <Button
                className='mr-2'
                key={i}
                onClick={() => {
                    checklistGroups && onTmpSave();
                    setPageNum(i);
                }}
                variant={i === pageNum ? 'info' : 'outline-info'}
            >
                {i}
            </Button>,
        ),
    );
    if (lastButton) {
        buttons.push(
            <label
                key={`last-separate-${pageNum}`}
                className='mr-2'
                style={{ padding: '0.375rem 0.75rem' }}
            >
                ...
            </label>,
        );
        buttons.push(
            <Button
                className='mr-2'
                key={totalPages}
                onClick={() => {
                    checklistGroups && onTmpSave();
                    setPageNum(totalPages);
                }}
                variant='outline-info'
            >
                {totalPages}
            </Button>,
        );
    }
    return buttons;
};

export const PagingButtons = (props: {
    page: number;
    totalPages: number;
    onChangePage: (n: number) => void;
    checklistGroups?: ChecklistGroup[];
}): ReactElement => {
    const { page, totalPages, onChangePage, checklistGroups } = props;
    const buttons = createPagingButtons(
        totalPages,
        page,
        (i: number) => onChangePage(i),
        checklistGroups,
    );
    return <div>{buttons}</div>;
};
