/**
 * Model Loader — Atentiv FastText WASM Runtime
 * Lazy loads the quantized .ftz model and WebAssembly engine in browser/extension/worker.
 */
import type { FastTextModel } from "fasttext.wasm.js/common";

export interface AtentivModelWrapper {
  isLoaded: boolean;
  predict: (text: string, k?: number, threshold?: number) => Array<{ label: string; score: number }>;
  getSentenceVector: (text: string) => Float32Array;
  getDimension: () => number;
  version: string;
}

let activeModelWrapper: AtentivModelWrapper | null = null;
let loadPromise: Promise<AtentivModelWrapper> | null = null;

export class ModelLoader {
  static getActiveModel(): AtentivModelWrapper | null {
    return activeModelWrapper;
  }

  static isLoaded(): boolean {
    return activeModelWrapper !== null && activeModelWrapper.isLoaded;
  }

  static async load(modelPathOverride?: string): Promise<AtentivModelWrapper> {
    if (activeModelWrapper) return activeModelWrapper;
    if (loadPromise) return loadPromise;

    loadPromise = (async () => {
      try {
        const isExtension = typeof chrome !== "undefined" && !!chrome.runtime?.id;

        if (isExtension) {
          // Browser extension environment
          const { getFastTextClass, getFastTextModule } = await import("fasttext.wasm.js/common");
          const wasmUrl = chrome.runtime.getURL("wasm/fastText.common.wasm");
          const modelUrl = modelPathOverride || chrome.runtime.getURL("models/atentiv-page-category.ftz");

          const FastText = await getFastTextClass({
            getFastTextModule: () => getFastTextModule({ wasmPath: wasmUrl }),
          });
          const ft = new FastText();
          const rawModel: FastTextModel = await ft.loadModel(modelUrl);

          activeModelWrapper = this.wrapModel(rawModel, "1.0.0");
          return activeModelWrapper;
        } else {
          // Node.js or development environment
          const { getFastTextClass, getFastTextModule } = await import("fasttext.wasm.js");
          const FastText = await getFastTextClass({ getFastTextModule });
          const ft = new FastText();
          const modelUrl = modelPathOverride || `file://${process.cwd()}/public/models/atentiv-page-category.ftz`;
          const rawModel = await ft.loadModel(modelUrl);

          activeModelWrapper = this.wrapModel(rawModel as unknown as FastTextModel, "1.0.0");
          return activeModelWrapper;
        }
      } catch (err) {
        console.warn("FastText WASM load failed, activating heuristic fallback model:", err);
        activeModelWrapper = this.createFallbackModel();
        return activeModelWrapper;
      }
    })();

    return loadPromise;
  }

  private static wrapModel(model: FastTextModel, version: string): AtentivModelWrapper {
    return {
      isLoaded: true,
      version,
      predict: (text: string, k = 3, threshold = 0.0) => {
        try {
          const res = model.predict(text, k, threshold);
          const out: Array<{ label: string; score: number }> = [];
          for (let i = 0; i < res.size(); i++) {
            const pair = res.get(i);
            const cleanLabel = pair[1].replace("__label__", "");
            out.push({ label: cleanLabel, score: Number(pair[0].toFixed(4)) });
          }
          return out;
        } catch {
          return [{ label: "Uncategorized", score: 0.5 }];
        }
      },
      getSentenceVector: (text: string) => {
        try {
          return model.getSentenceVector(text);
        } catch {
          return new Float32Array(50);
        }
      },
      getDimension: () => {
        try {
          return model.getDimension();
        } catch {
          return 50;
        }
      },
    };
  }

  private static createFallbackModel(): AtentivModelWrapper {
    return {
      isLoaded: true,
      version: "fallback-heuristics-1.0",
      predict: (text: string) => {
        const lower = text.toLowerCase();
        if (lower.includes("code") || lower.includes("python") || lower.includes("git")) {
          return [{ label: "Technology", score: 0.9 }, { label: "Education", score: 0.4 }];
        }
        if (lower.includes("paper") || lower.includes("arxiv") || lower.includes("study")) {
          return [{ label: "Education", score: 0.9 }, { label: "Technology", score: 0.5 }];
        }
        if (lower.includes("video") || lower.includes("watch") || lower.includes("music")) {
          return [{ label: "Entertainment", score: 0.9 }];
        }
        if (lower.includes("shop") || lower.includes("cart") || lower.includes("buy")) {
          return [{ label: "Shop", score: 0.9 }];
        }
        return [{ label: "Uncategorized", score: 0.6 }];
      },
      getSentenceVector: () => new Float32Array(50),
      getDimension: () => 50,
    };
  }
}
