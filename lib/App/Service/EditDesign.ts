import {
    Contract,
    Design,
    DesignContractType,
    MigrationStatus,
} from '@/Domain/Entity';
import { DocumentNumber } from '@/Domain/ValueObject/DocumentNumber';

export interface EditDesignForm {
    id: number | null;
    name: string;
    designChiefId: number | null;
    designStaffId: number | null;
    contractType: DesignContractType;
    specFile: File | null;
    memo: string;
    documentNumber: string;
    expectedPrice: string;
    expectedConstructionOrderDateWhenDesigning?: string;
    expectedStartAt?: string;
    expectedEndAt: string;
    startAt?: string;
    endAt?: string;
}

export class EditDesign {
    static createEmptyForm(): EditDesignForm {
        return {
            id: null,
            name: '',
            designChiefId: null,
            designStaffId: null,
            contractType: DesignContractType.Internal,
            specFile: null,
            memo: '',
            documentNumber: '',
            expectedPrice: '',
            expectedConstructionOrderDateWhenDesigning: '',
            expectedStartAt: '',
            expectedEndAt: '',
            startAt: '',
            endAt: '',
        };
    }

    static designToForm(design: Design): EditDesignForm {
        return {
            id: design.id,
            name: design.name,
            designChiefId: design.latestContract.designChiefId,
            designStaffId: design.latestContract.designStaffId,
            contractType: design.contractType,
            specFile: null,
            memo: design.memo,
            documentNumber: design.documentNumber?.value || '',
            expectedPrice:
                design.latestContract.expectedPrice?.toString() || '',
            expectedConstructionOrderDateWhenDesigning:
                design.latestContract.expectedConstructionOrderDateWhenDesigning
                    ?.toISOString()
                    .slice(0, 10) || '',
            expectedStartAt:
                design.latestContract.expectedStartAt
                    ?.toISOString()
                    .slice(0, 10) || '',
            expectedEndAt:
                design.latestContract.expectedEndAt
                    ?.toISOString()
                    .slice(0, 10) || '',
            startAt:
                design.latestContract.startAt?.toISOString().slice(0, 10) || '',
            endAt:
                design.latestContract.endAt?.toISOString().slice(0, 10) || '',
        };
    }

    static formToDesign(form: EditDesignForm): Design {
        const contract = new Contract({
            specFile: form.specFile,
            designId: form.id,
            designChiefId: form.designChiefId,
            designStaffId: form.designStaffId,
            expectedPrice: Number(form.expectedPrice),
            expectedConstructionOrderDateWhenDesigning:
                form.expectedConstructionOrderDateWhenDesigning
                    ? new Date(form.expectedConstructionOrderDateWhenDesigning)
                    : null,
            expectedStartAt: form.expectedStartAt
                ? new Date(form.expectedStartAt)
                : null,
            expectedEndAt: new Date(form.expectedEndAt),
            startAt: form.startAt ? new Date(form.startAt) : null,
            endAt: form.endAt ? new Date(form.endAt) : null,
        });
        return new Design(
            form.id,
            form.name,
            form.contractType,
            form.memo,
            new DocumentNumber(form.documentNumber),
            [contract],
            new Date(),
            new Date(),
            false,
            MigrationStatus.Open,
        );
    }
}
