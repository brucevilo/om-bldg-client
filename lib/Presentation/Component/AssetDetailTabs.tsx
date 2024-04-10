import { SapFixedAsset } from '@/Domain/Entity';
import React, { FC } from 'react';
import { Tabs } from '.';

interface AssetDeitalTabsProps {
    sapFixedAsset: SapFixedAsset;
}

export const AssetDetailTabs: FC<AssetDeitalTabsProps> = ({
    sapFixedAsset,
}) => {
    return (
        <Tabs
            isRounded
            className='mb-3'
            items={[
                {
                    href: '/assets/[parent_asset_id]/summary',
                    as: `/assets/${sapFixedAsset.id}/summary`,
                    text: '概要',
                },
                {
                    href: '/assets/[asset_statement_id]/checklist?status=unchecked',
                    as: `/assets/${sapFixedAsset.id}/checklist?status=unchecked`,
                    text: '現物照合ステータス',
                    isActive: currentUrl => {
                        return (
                            currentUrl.split('?')[0] ===
                            `/assets/${sapFixedAsset.id}/checklist`
                        );
                    },
                },
                {
                    href: '/assets/[asset_statement_id]/retirement?status=rest',
                    as: `/assets/${sapFixedAsset.id}/retirement?status=rest`,
                    text: '除却ステータス',
                    isActive: currentUrl => {
                        return (
                            currentUrl.split('?')[0] ===
                            `/assets/${sapFixedAsset.id}/retirement`
                        );
                    },
                },
            ]}
        />
    );
};
