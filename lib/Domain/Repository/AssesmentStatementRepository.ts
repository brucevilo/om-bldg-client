import { AssessmentStatement } from '../Entity';
import { getClient } from '@/Infrastructure';
import {
    AssessmentStatementFactory,
    AssessmentStatementResponse,
} from '../Factory';

export class AssessmentStatementRepository {
    public static async store(
        assesmentStatements: AssessmentStatement[],
        contractId: number,
    ): Promise<void> {
        await getClient().post(
            `/contracts/${contractId}/assessment_statements`,
            {
                assessment_statements: assesmentStatements.map(as => ({
                    part: as.part,
                    name: as.name,
                    size: as.size,
                    amount: as.amount,
                    unit: as.unit,
                    cost_document_price: as.costDocumentPrice,
                    price: as.price,
                    is_open: as.isOpen,
                    construction_type_serial_number:
                        as.constructionTypeSerialNumber,
                })),
            },
        );
    }

    public static async update(
        assessmentStatements: AssessmentStatement[],
    ): Promise<void> {
        await getClient().patch('/assessment_statements', {
            assessment_statements: assessmentStatements.map(as => ({
                id: as.id,
                price: as.price,
                is_open: as.isOpen,
            })),
        });
    }

    public static async findByContract(
        contractId: number,
    ): Promise<AssessmentStatement[]> {
        const res = await getClient().get<AssessmentStatementResponse[]>(
            `/contracts/${contractId}/assessment_statements`,
        );
        return res.data.map(AssessmentStatementFactory.createFromResponse);
    }
}
