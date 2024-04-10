import React, { FC } from 'react';
import { Accordion } from 'react-bootstrap';

export const UploadCostDocumentModalWarnings: FC = () => {
    return (
        <Accordion className='mt-3'>
            <div className='text-right mb-1'>
                <Accordion.Toggle
                    as={'small'}
                    eventKey='0'
                    style={{ cursor: 'pointer' }}
                    className='text-muted'
                >
                    注意点はこちら▼
                </Accordion.Toggle>
            </div>

            <Accordion.Collapse eventKey='0'>
                <small>
                    ・EOLの前行に合計金額の記載はありますか？
                    <br />
                    ・L列(変更内訳書の場合はO列)に費目行の場合は「費目」、明細行の場合は「業務」の記載はありますか？
                </small>
            </Accordion.Collapse>
        </Accordion>
    );
};
