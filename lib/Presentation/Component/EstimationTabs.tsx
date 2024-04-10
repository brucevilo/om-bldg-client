import React, { FC } from 'react';
import { Tabs } from '.';

interface Props {
    constructionId: number;
    contractId: number;
}

export const EstimationTabs: FC<Props> = ({ constructionId, contractId }) => {
    return (
        <Tabs
            className='my-4 text-center'
            items={[
                {
                    href: `/constructions/[id]/estimation?contract_id=${contractId}`,
                    as: `/constructions/${constructionId}/estimation?contract_id=${contractId}`,
                    text: '基本情報',
                    isActive: url => url.split('?')[0].endsWith('/estimation'),
                },
                {
                    href: `/constructions/[id]/estimation/construction_statements?contract_id=${contractId}`,
                    as: `/constructions/${constructionId}/estimation/construction_statements?contract_id=${contractId}`,
                    text: '工事明細',
                    isActive: url =>
                        url.split('?')[0].endsWith('/construction_statements'),
                },
                {
                    href: `/constructions/[id]/estimation/asset_class?contract_id=${contractId}`,
                    as: `/constructions/${constructionId}/estimation/asset_class?contract_id=${contractId}`,
                    text: '資産クラス',
                    isActive: url => url.split('?')[0].endsWith('/asset_class'),
                },
                {
                    href: `/constructions/[id]/estimation/asset_statements?contract_id=${contractId}`,
                    as: `/constructions/${constructionId}/estimation/asset_statements?contract_id=${contractId}`,
                    text: '資産管理明細',
                    isActive: url =>
                        url.split('?')[0].endsWith('/asset_statements'),
                },
            ]}
        />
    );
};
