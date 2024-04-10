import { AssetClassService } from '@/Domain/Service';
import { dummyConstructionStatement } from '@/__test__/dummy';
import { Classification } from '../Entity';

test('資産クラスが紐づいている明細項目の全ての勘定科目「項」を返す', () => {
    const constructionStatements = [1, 2, 3].map(n =>
        dummyConstructionStatement(n, Classification.Asset),
    );
    const accountItemKous =
        AssetClassService.accountItemKousAssocitingWithCostItem(
            constructionStatements,
        );
    expect(accountItemKous[0]).toBe('05建物');
});
