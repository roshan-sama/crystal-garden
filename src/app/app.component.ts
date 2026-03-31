import { Component, inject } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { GardenCanvasComponent } from './features/garden-canvas/garden-canvas.component';
import { NewCrystalWorkflowComponent } from './features/new-crystal-workflow/new-crystal-workflow.component';
import { CrystalService } from './core/services/crystal.service';

interface BackgroundOption {
  label: string;
  path: string;
}

interface AppOptions {
  backgrounds: BackgroundOption[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GardenCanvasComponent, NewCrystalWorkflowComponent],
  template: `
    <div style="display:flex;flex-direction:column;width:100vw;min-height:100vh;padding-top:8px;background:black;">

      <!-- Top bar: background selector -->
      <div style="width:1152px;margin:0 auto;padding:0 16px;color:white;display:flex;align-items:center;gap:12px;margin-bottom:8px;">
        <span>Your Garden is</span>
        <select
          class="garden-select"
          [value]="crystalSvc.backgroundSrc()"
          (change)="onBackgroundChange($event)"
        >
          @for (bg of backgrounds(); track bg.path) {
            <option [value]="bg.path">{{ bg.label }}</option>
          }
        </select>
      </div>

      <!-- Canvas -->
      <div style="margin:0 auto;">
        <app-garden-canvas />
      </div>

      <!-- Crystal creator dialog -->
      <app-new-crystal-workflow />
    </div>
  `,
  styles: [`
    .garden-select {
      background: #1f2937;
      color: white;
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 6px;
      padding: 6px 10px;
      font-size: 0.9rem;
      cursor: pointer;
    }
  `],
})
export class AppComponent {
  readonly crystalSvc = inject(CrystalService);

  // Load background options via httpResource
  private readonly appOptions = httpResource<AppOptions>(() => 'crystal-options.json');

  readonly backgrounds = () =>
    this.appOptions.value()?.backgrounds ?? [
      { label: 'Floral', path: 'images/abs158-floral.png' },
    ];

  onBackgroundChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.crystalSvc.backgroundSrc.set(select.value);
  }
}
