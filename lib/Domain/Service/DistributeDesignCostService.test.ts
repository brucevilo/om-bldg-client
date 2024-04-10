import { DistributeDesignCostService } from '.';
import {
    AssetStatement,
    Classification,
    ConstructionStatement,
    Contract,
    Design,
    DesignContractType,
    MigrationStatus,
} from '../Entity';
import { DocumentNumber } from '../ValueObject/DocumentNumber';

test(`
    按分前
    Design A: 20000, Design B: 40000
    ConstructionStatement C
        AssetStatement C-1: 10000
    ConstructionStatement D
        AssetStatement D-1: 16700
        AssetStatement D-2: 3300
    按分される設計委託費
    ConstructionStatement C: 20000
        AssetStatement C-1: 20000
    ConstructionStatement D: 40000
        AssetStatement D-1: 33000
        AssetStatement D-2: 7000
`, () => {
    const a = new Design(
        1,
        'a',
        DesignContractType.External,
        '',
        new DocumentNumber('20229999'),
        [new Contract({ contractedPrice: 20000 })],
        new Date(),
        new Date(),
        false,
        MigrationStatus.Open,
    );
    const b = new Design(
        2,
        'b',
        DesignContractType.External,
        '',
        new DocumentNumber('20223333'),
        [new Contract({ contractedPrice: 40000 })],
        new Date(),
        new Date(),
        false,
        MigrationStatus.Open,
    );
    const c = new ConstructionStatement(
        1,
        1,
        '東梅田駅-c',
        '1',
        new Date(),
        [],
        Classification.Asset,
        false,
        false,
        null,
        new Date(),
        false,
        null,
        null,
        null,
        [],
        new Date(),
        new Date(),
    );
    const c1 = new AssetStatement(
        1,
        1,
        null,
        'c-1',
        10000,
        '1',
        null,
        null,
        false,
        null,
        null,
        0,
        0,
        new Date(),
        new Date(),
        1,
    );
    const d = new ConstructionStatement(
        2,
        1,
        '東梅田駅-d',
        '',
        new Date(),
        [],
        Classification.Asset,
        false,
        false,
        null,
        new Date(),
        false,
        null,
        null,
        null,
        [],
        new Date(),
        new Date(),
    );
    const d1 = new AssetStatement(
        2,
        2,
        null,
        'd-1',
        16700,
        '',
        null,
        null,
        false,
        null,
        null,
        0,
        0,
        new Date(),
        new Date(),
        1,
    );
    const d2 = new AssetStatement(
        3,
        2,
        null,
        'd-2',
        3300,
        '',
        null,
        null,
        false,
        null,
        null,
        0,
        0,
        new Date(),
        new Date(),
        1,
    );
    const service = new DistributeDesignCostService(
        [c, d],
        [c1, d1, d2],
        [a, b],
    );
    const distributed = service.invoke();
    // c-1
    expect(distributed.find(d => d.id === 1)?.distributedDesignCost).toBe(
        20000,
    );
    // d-1
    expect(distributed.find(d => d.id === 2)?.distributedDesignCost).toBe(
        33000,
    );
    // d-2
    expect(distributed.find(d => d.id === 3)?.distributedDesignCost).toBe(7000);
});
