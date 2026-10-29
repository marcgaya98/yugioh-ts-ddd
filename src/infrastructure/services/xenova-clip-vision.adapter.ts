import fs from 'fs';
import { ClipVisionPort } from '../../domain/ai-search/repositories/card-embedding.repository.interface';
import { VISUAL_CONCEPTS } from '../../domain/ai-search/value-objects/visual-concepts.catalog';

const CLIP_MODEL_IDENTIFIER = 'Xenova/clip-vit-base-patch32';

type ZeroShotClassifier = (
  imagePath: string,
  candidateLabels: string[]
) => Promise<Array<{ label: string; score: number }>>;

export class XenovaClipVisionAdapter implements ClipVisionPort {
  private classifier: ZeroShotClassifier | null = null;

  public async generateImageEmbedding(imagePath: string): Promise<number[] | null> {
    if (!fs.existsSync(imagePath)) {
      return null;
    }

    try {
      const model = await this.getOrInitializeClassifier();
      const conceptScores: number[] = [];

      for (const concept of VISUAL_CONCEPTS) {
        const score = await this.classifySingleConcept(model, imagePath, concept);
        conceptScores.push(score);
      }

      return conceptScores;
    } catch {
      return null;
    }
  }

  private async getOrInitializeClassifier(): Promise<ZeroShotClassifier> {
    if (this.classifier) {
      return this.classifier;
    }

    const dynamicImporter = new Function('modulePath', 'return import(modulePath)') as (
      modulePath: string
    ) => Promise<{ pipeline: (task: string, model: string, options: object) => Promise<ZeroShotClassifier> }>;

    const transformers = await dynamicImporter('@xenova/transformers');
    this.classifier = await transformers.pipeline(
      'zero-shot-image-classification',
      CLIP_MODEL_IDENTIFIER,
      { quantized: false, device: 'cpu' }
    );

    return this.classifier;
  }

  private async classifySingleConcept(
    model: ZeroShotClassifier,
    imagePath: string,
    concept: string
  ): Promise<number> {
    try {
      const result = await model(imagePath, [concept, 'other']);
      return result.find(item => item.label === concept)?.score ?? 0;
    } catch {
      return 0;
    }
  }
}

