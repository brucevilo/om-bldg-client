import {
    AssessmentStatementFactory,
    AssessmentStatementResponse,
} from './AssessmentStatementFactory';

test('create', () => {
    const res: AssessmentStatementResponse = {
        id: 1,
        part: 'part',
        name: 'name',
        size: 'size',
        amount: 100,
        unit: 'unit',
        cost_document_price: 200,
        price: 300,
        is_open: true,
        construction_type_serial_number: 1000,
    };
    const assessmentStatement =
        AssessmentStatementFactory.createFromResponse(res);
    expect(assessmentStatement.id).toBe(res.id);
    expect(assessmentStatement.part).toBe(res.part);
    expect(assessmentStatement.name).toBe(res.name);
    expect(assessmentStatement.size).toBe(res.size);
    expect(assessmentStatement.amount).toBe(res.amount);
    expect(assessmentStatement.unit).toBe(res.unit);
    expect(assessmentStatement.costDocumentPrice).toBe(res.cost_document_price);
    expect(assessmentStatement.price).toBe(res.price);
    expect(assessmentStatement.isOpen).toBe(res.is_open);
    expect(assessmentStatement.constructionTypeSerialNumber).toBe(
        res.construction_type_serial_number,
    );
});
