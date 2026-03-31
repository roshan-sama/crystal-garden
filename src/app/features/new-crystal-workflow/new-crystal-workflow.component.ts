import {
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ICrystal } from '../../core/models/crystal.model';
import { CrystalService } from '../../core/services/crystal.service';
import { AudioService } from '../../core/services/audio.service';

interface CrystalShape {
  label: string;
  path: string;
}

interface ColorOption {
  name: string;
  value: string;
}

interface ToneOption {
  note: string;
  frequency: number;
}

interface CrystalOptions {
  crystalShapes: CrystalShape[];
  colorOptions: ColorOption[];
  toneOptions: ToneOption[];
}

@Component({
  selector: 'app-new-crystal-workflow',
  standalone: true,
  imports: [FormsModule],
  template: `
    <!-- Trigger button -->
    <button class="add-btn" (click)="open()">Add Crystal</button>

    <!-- Modal backdrop -->
    @if (isOpen()) {
      <div class="backdrop" (click)="close()">
        <div class="dialog" (click)="$event.stopPropagation()">
          <div class="dialog-header">
            <h2>Create New Crystal</h2>
            <p>Design your crystal by selecting its appearance, colour, and tone.</p>
          </div>

          @if (options.isLoading()) {
            <p class="loading">Loading crystal options…</p>
          } @else if (options.error()) {
            <p class="error">Failed to load options. Please refresh.</p>
          } @else {
            <div class="dialog-body">
              <!-- Left: tabs -->
              <div class="tabs-panel">
                <!-- Tab headers -->
                <div class="tab-list">
                  @for (tab of ['Shape', 'Color', 'Tone']; track tab) {
                    <button
                      class="tab-btn"
                      [class.active]="activeTab() === tab"
                      (click)="activeTab.set(tab)"
                    >{{ tab }}</button>
                  }
                </div>

                <!-- Shape tab -->
                @if (activeTab() === 'Shape') {
                  <div class="tab-content">
                    <h3>Select Crystal Shape</h3>
                    <div class="shape-grid">
                      @for (shape of shapes(); track shape.path) {
                        <div
                          class="shape-card"
                          [class.selected]="selectedShapePath() === shape.path"
                          (click)="selectedShapePath.set(shape.path)"
                        >
                          <img [src]="shape.path" [alt]="shape.label" />
                          <span>{{ shape.label }}</span>
                        </div>
                      }
                    </div>
                  </div>
                }

                <!-- Color tab -->
                @if (activeTab() === 'Color') {
                  <div class="tab-content">
                    <h3>Select Crystal Color</h3>
                    <div class="color-grid">
                      @for (color of colors(); track color.value) {
                        <div
                          class="color-swatch"
                          [class.selected]="selectedColor() === color.value"
                          [style.background]="color.value"
                          [title]="color.name"
                          (click)="selectedColor.set(color.value)"
                        ></div>
                      }
                    </div>
                  </div>
                }

                <!-- Tone tab -->
                @if (activeTab() === 'Tone') {
                  <div class="tab-content">
                    <h3>Select Crystal Tone</h3>
                    <div class="tone-labels">
                      <span>Bass C (C3)</span><span>Middle C</span><span>High C (C5)</span>
                    </div>
                    <input
                      type="range"
                      [min]="0"
                      [max]="toneCount() - 1"
                      [ngModel]="selectedToneIndex()"
                      (ngModelChange)="selectedToneIndex.set($event)"
                      class="tone-slider"
                    />
                    <div class="tone-info">
                      <div>
                        <span>Selected Note:</span>
                        <strong>{{ selectedTone().note }}</strong>
                      </div>
                      <div>
                        <span>Frequency:</span>
                        <strong>{{ selectedTone().frequency }} Hz</strong>
                      </div>
                    </div>
                    <button class="play-btn" (click)="playPreviewTone()">Play Tone</button>
                  </div>
                }
              </div>

              <!-- Right: preview -->
              <div class="preview-panel">
                <h3>Crystal Preview</h3>
                <div class="preview-canvas">
                  @if (previewDataUrl()) {
                    <div [style.filter]="'drop-shadow(0 0 10px ' + selectedColor() + ')'">
                      <img [src]="previewDataUrl()" alt="Crystal preview" class="preview-img" />
                    </div>
                  }
                </div>
                <button
                  class="place-btn"
                  [disabled]="!previewDataUrl()"
                  (click)="placeCrystal()"
                >
                  Place Crystal in Garden
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .add-btn {
      position: fixed; bottom: 16px; right: 16px;
      background: #4f46e5; color: white; border: none;
      border-radius: 50px; padding: 14px 24px;
      font-size: 1rem; cursor: pointer; z-index: 100;
    }
    .add-btn:hover { background: #4338ca; }

    .backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.7);
      display: flex; align-items: center; justify-content: center; z-index: 200;
    }
    .dialog {
      background: #111827; color: white; border-radius: 12px;
      padding: 24px; width: 900px; max-height: 90vh; overflow-y: auto;
    }
    .dialog-header h2 { margin: 0 0 4px; font-size: 1.4rem; }
    .dialog-header p { margin: 0 0 16px; color: #9ca3af; }

    .loading, .error { text-align: center; padding: 32px; }
    .error { color: #f87171; }

    .dialog-body { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }

    .tab-list { display: flex; gap: 4px; margin-bottom: 16px; }
    .tab-btn {
      flex: 1; padding: 8px; background: rgba(255,255,255,0.08);
      color: white; border: none; border-radius: 8px; cursor: pointer;
    }
    .tab-btn.active { background: rgba(99,102,241,0.8); }

    .tab-content h3 { margin: 0 0 12px; font-size: 1rem; }

    .shape-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .shape-card {
      background: #1f2937; border-radius: 8px; padding: 12px;
      cursor: pointer; text-align: center; border: 2px solid transparent;
      display: flex; flex-direction: column; align-items: center; gap: 6px;
    }
    .shape-card.selected { border-color: white; }
    .shape-card img { width: 64px; height: 64px; object-fit: contain; }
    .shape-card span { font-size: 0.8rem; color: #d1d5db; }

    .color-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
    .color-swatch {
      height: 56px; border-radius: 8px; cursor: pointer;
      border: 2px solid transparent;
    }
    .color-swatch.selected { border-color: white; }

    .tone-labels {
      display: flex; justify-content: space-between;
      font-size: 0.8rem; color: #9ca3af; margin-bottom: 6px;
    }
    .tone-slider { width: 100%; accent-color: #6366f1; }
    .tone-info {
      display: flex; justify-content: space-between;
      background: #1f2937; border-radius: 8px; padding: 12px;
      margin-top: 12px;
    }
    .tone-info div { display: flex; flex-direction: column; gap: 4px; }
    .tone-info span { font-size: 0.8rem; color: #9ca3af; }
    .tone-info strong { font-size: 1.2rem; }
    .play-btn {
      margin-top: 12px; width: 100%; padding: 10px;
      background: #374151; color: white; border: none; border-radius: 8px; cursor: pointer;
    }
    .play-btn:hover { background: #4b5563; }

    .preview-panel {
      background: #1f2937; border-radius: 12px; padding: 16px;
      display: flex; flex-direction: column; gap: 12px;
    }
    .preview-panel h3 { margin: 0; font-size: 1rem; }
    .preview-canvas {
      flex: 1; background: black; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      min-height: 200px;
    }
    .preview-img { max-width: 200px; max-height: 200px; object-fit: contain; }
    .place-btn {
      padding: 12px; background: #4f46e5; color: white;
      border: none; border-radius: 8px; cursor: pointer; font-size: 1rem;
    }
    .place-btn:hover:not(:disabled) { background: #4338ca; }
    .place-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  `],
})
export class NewCrystalWorkflowComponent {
  private readonly crystalSvc = inject(CrystalService);
  private readonly audioSvc = inject(AudioService);

  // ─── httpResource: loads crystal options from a static JSON asset ──────────
  readonly options = httpResource<CrystalOptions>(() => 'crystal-options.json');

  // ─── Derived signals from the resource ────────────────────────────────────
  readonly shapes = computed<CrystalShape[]>(
    () => this.options.value()?.crystalShapes ?? []
  );
  readonly colors = computed<ColorOption[]>(
    () => this.options.value()?.colorOptions ?? []
  );
  readonly tones = computed<ToneOption[]>(
    () => this.options.value()?.toneOptions ?? []
  );
  readonly toneCount = computed(() => this.tones().length);

  // ─── UI state ──────────────────────────────────────────────────────────────
  readonly isOpen = signal(false);
  readonly activeTab = signal('Shape');
  readonly selectedShapePath = signal('');
  readonly selectedColor = signal('');
  readonly selectedToneIndex = signal(7); // default to Middle C
  readonly previewDataUrl = signal<string | null>(null);

  readonly selectedTone = computed(() => this.tones()[this.selectedToneIndex()]);

  constructor() {
    // Set defaults once the resource resolves
    effect(() => {
      const shapes = this.shapes();
      const colors = this.colors();
      if (shapes.length && !this.selectedShapePath()) {
        this.selectedShapePath.set(shapes[0].path);
      }
      if (colors.length && !this.selectedColor()) {
        this.selectedColor.set(colors[0].value);
      }
    });

    // Re-render preview whenever relevant state changes
    effect(() => {
      const shapePath = this.selectedShapePath();
      const color = this.selectedColor();
      // read toneIndex to track it (not used in render but keeps things reactive)
      this.selectedToneIndex();

      if (this.isOpen() && shapePath && color) {
        this.renderPreview(shapePath, color);
      }
    });
  }

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  playPreviewTone(): void {
    const tone = this.selectedTone();
    if (!tone) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = tone.frequency;
    osc.connect(ctx.destination);
    osc.start();
    setTimeout(() => osc.stop(), 1000);
  }

  placeCrystal(): void {
    const shapePath = this.selectedShapePath();
    const color = this.selectedColor();
    const tone = this.selectedTone();
    if (!shapePath || !color || !tone) return;

    // Build the crystal canvas (tinted sprite)
    const offscreen = document.createElement('canvas');
    offscreen.width = 128;
    offscreen.height = 128;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = shapePath;
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 128, 128);
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.5;
      ctx.fillRect(0, 0, 128, 128);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;

      const crystal: ICrystal = {
        spritePath: shapePath,
        color,
        tone: tone.frequency,
        scale: 1,
        x: 576,
        y: 324,
        crystalCanvas: offscreen,
        isPlaced: false,
      };

      this.crystalSvc.addCrystal(crystal);
      const newIndex = this.crystalSvc.crystals().length - 1;
      this.crystalSvc.beginPlacement(newIndex, 576, 324);
      this.audioSvc.resume();
      this.close();
    };
  }

  private renderPreview(shapePath: string, color: string): void {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = shapePath;
    img.onload = () => {
      ctx.clearRect(0, 0, 128, 128);
      ctx.drawImage(img, 0, 0, 128, 128);
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.5;
      ctx.fillRect(0, 0, 128, 128);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      this.previewDataUrl.set(canvas.toDataURL());
    };
  }
}
