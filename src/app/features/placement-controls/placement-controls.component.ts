import { Component, output } from '@angular/core';

@Component({
  selector: 'app-placement-controls',
  standalone: true,
  template: `
    <div style="
      position: absolute;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 8px;
      background: rgba(0,0,0,0.7);
      border-radius: 12px;
      padding: 12px 16px;
      z-index: 10;
    ">
      <button class="ctrl-btn" (click)="rotateCounterClockwise.emit()">↺</button>
      <button class="ctrl-btn" (click)="rotateClockwise.emit()">↻</button>
      <button class="ctrl-btn" (click)="decreaseScale.emit()">−</button>
      <button class="ctrl-btn" (click)="increaseScale.emit()">+</button>
      <button class="ctrl-btn done-btn" (click)="done.emit()">Done</button>
    </div>
  `,
  styles: [`
    .ctrl-btn {
      background: rgba(255,255,255,0.15);
      color: white;
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 8px;
      padding: 8px 14px;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.15s;
    }
    .ctrl-btn:hover { background: rgba(255,255,255,0.3); }
    .done-btn {
      background: rgba(99,102,241,0.8);
      border-color: rgba(99,102,241,0.9);
    }
    .done-btn:hover { background: rgba(99,102,241,1); }
  `],
})
export class PlacementControlsComponent {
  readonly done = output<void>();
  readonly rotateClockwise = output<void>();
  readonly rotateCounterClockwise = output<void>();
  readonly increaseScale = output<void>();
  readonly decreaseScale = output<void>();
}
