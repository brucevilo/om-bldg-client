import { Classification } from '@/Domain/Entity';

export class TextToEnum {
    static TextToConstructionStatementClassification(
        classification: string,
    ): Classification {
        switch (classification) {
            case '資産':
                return Classification.Asset;
            case '費用':
                return Classification.Cost;
        }
        return Classification.Cost;
    }
}
