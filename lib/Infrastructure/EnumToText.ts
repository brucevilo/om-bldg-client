import { Classification, ProjectClassification } from '@/Domain/Entity';

export class EnumToText {
    static ConstructionStatementClassificationToText(
        classification: Classification,
    ): string {
        switch (classification) {
            case Classification.Asset:
                return '資産';
            case Classification.Cost:
                return '費用';
        }
    }

    static ProjectClassificationToText(
        classification: ProjectClassification,
    ): string {
        switch (classification) {
            case ProjectClassification.InvestmentBudget:
                return '投資予算';
            case ProjectClassification.RemovalCost:
                return '撤去費';
            case ProjectClassification.RepairCost:
                return '修繕費';
        }
    }
}
