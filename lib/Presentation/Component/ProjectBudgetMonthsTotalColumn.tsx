import React, { FC } from 'react';

interface Props {
    rowSpan: number;
    backgroundColor: string;
    textCenter?: boolean;
}

export const ProjectBudgetMonthsTotalColumn: FC<Props> = ({
    children,
    rowSpan,
    backgroundColor,
    textCenter,
}) => {
    return (
        <th
            className={`align-middle position-sticky border p-0 ${
                textCenter ? 'text-center' : ''
            }`}
            style={{
                width: '120px',
                right: '0',
                top: '0',
                backgroundColor,
            }}
            rowSpan={rowSpan}
        >
            {children}
        </th>
    );
};
