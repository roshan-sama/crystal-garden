import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  afterRenderEffect,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { CrystalService } from '../../core/services/crystal.service';
import { AudioService } from '../../core/services/audio.service';
import { CanvasRendererService } from '../../core/services/canvas-renderer.service';
import { CanvasFrameState } from '../../core/models/crystal.model';
import { PlacementControlsComponent } from '../placement-controls/placement-controls.component';

@Component({
  selector: 'app-garden-canvas',
  standalone: true,
  imports: [PlacementControlsComponent],
  template: `
    <div style="position:relative;width:1152px;height:648px;">
      <canvas
        #gardenCanvas
        (click)="onCanvasClick($event)"
        (mousedown)="onPointerDown($event)"
        (mousemove)="onPointerMove($event)"
        (mouseup)="onPointerUp($event)"
        [style.cursor]="canvasMode() === 'Crystal Placement' ? 'crosshair' : 'default'"
        style="position:absolute;top:0;left:0;width:100%;height:100%;"
      ></canvas>

      @if (canvasMode() === 'Crystal Placement' && crystalSvc.placementState()) {
        <app-placement-controls
          (done)="crystalSvc.finalizePlacement(
            crystalSvc.placementState()!.crystalIndex,
            crystalSvc.placementState()!.x,
            crystalSvc.placementState()!.y,
            crystalSvc.placementState()!.rotation,
            crystalSvc.placementState()!.scale
          )"
          (rotateClockwise)="crystalSvc.rotateClockwise()"
          (rotateCounterClockwise)="crystalSvc.rotateCounterClockwise()"
          (increaseScale)="crystalSvc.increaseScale()"
          (decreaseScale)="crystalSvc.decreaseScale()"
        />
      }
    </div>
  `,
})
export class GardenCanvasComponent implements OnInit, OnDestroy {
  @ViewChild('gardenCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  readonly crystalSvc = inject(CrystalService);
  private readonly audioSvc = inject(AudioService);
  private readonly renderer = inject(CanvasRendererService);

  readonly canvasMode = this.crystalSvc.canvasMode;

  private backgroundImg = signal<HTMLImageElement | null>(null);
  private backgroundOutline = signal<HTMLImageElement | null>(null);
  private animFrameId = 0;

  constructor() {
    /**
     * afterRenderEffect runs after every Angular render cycle.
     *
     * earlyRead phase  — reactive: reads signals (crystals, pulsingState, etc.)
     *                    and computes collision detection results.
     *                    Returns a CanvasFrameState snapshot plus collision data
     *                    so the write phase does not need to read signals again.
     *
     * write phase      — non-reactive: draws the frame to the canvas DOM,
     *                    then applies any signal updates discovered during
     *                    earlyRead (activations, pulse advancement, animation pruning).
     */
    afterRenderEffect({
      earlyRead: () => {
        const now = performance.now();
        const pulsingState = this.crystalSvc.pulsingState();
        const crystals = this.crystalSvc.crystals();
        const activatedCrystals = this.crystalSvc.activatedCrystals();

        // Compute next pulse state and detect collisions (pure computation, no side effects)
        let newRadius = 0;
        let newlyActivated: number[] = [];

        if (pulsingState) {
          const deltaTime = (now - pulsingState.lastFrameTime) / 1000;
          newRadius = this.renderer.nextRadius(pulsingState.currentRadius, deltaTime);
          newlyActivated = this.renderer.detectCollisions(
            pulsingState,
            newRadius,
            crystals,
            activatedCrystals
          );
        }

        const snapshot: CanvasFrameState = {
          crystals,
          pulsingState: pulsingState
            ? { ...pulsingState, currentRadius: newRadius }
            : null,
          canvasMode: this.crystalSvc.canvasMode(),
          placementState: this.crystalSvc.placementState(),
          activatedCrystals,
          crystalAnimations: this.crystalSvc.crystalAnimations(),
          currentTime: now,
        };

        return { snapshot, newRadius, newlyActivated, now };
      },

      write: (stateSignal, _cleanup) => {
        // stateSignal is a Signal<earlyRead return type>; read it untracked.
        const { snapshot, newRadius, newlyActivated, now } = stateSignal();

        const canvas = this.canvasRef.nativeElement;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Draw the frame using the snapshot from earlyRead
        untracked(() => {
          this.renderer.drawFrame(
            ctx,
            snapshot,
            this.backgroundImg(),
            this.backgroundOutline()
          );
        });

        // Apply signal updates (pulse advancement, crystal activations, animation pruning)
        untracked(() => {
          const current = this.crystalSvc.pulsingState();

          if (current) {
            // Activate crystals whose positions the pulse just crossed
            newlyActivated.forEach((idx: number) => {
              this.audioSvc.playCrystalTone(snapshot.crystals[idx].tone);
              this.crystalSvc.activateCrystal(idx, now);
            });

            if (newRadius >= 1322) {
              this.crystalSvc.endPulse();
            } else {
              this.crystalSvc.updatePulse(newRadius, now);
            }
          }

          this.crystalSvc.pruneAnimations(now);
        });
      },
    });
  }

  ngOnInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.renderer.setupCanvas(canvas);
    this.loadBackground(this.crystalSvc.backgroundSrc());

    // Reload background image whenever the backgroundSrc signal changes
    effect(() => {
      const src = this.crystalSvc.backgroundSrc();
      untracked(() => this.loadBackground(src));
    });
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animFrameId);
    this.audioSvc.dispose();
  }

  loadBackground(src: string): void {
    const img = new Image();
    img.src = src;
    img.onload = () => this.backgroundImg.set(img);

    const outline = new Image();
    outline.src = 'images/garden-outline.png';
    outline.onload = () => this.backgroundOutline.set(outline);
  }

  onCanvasClick(event: MouseEvent): void {
    if (this.crystalSvc.canvasMode() !== 'Emit Pulse') return;
    this.audioSvc.resume();

    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.crystalSvc.startPulse(event.clientX - rect.left, event.clientY - rect.top);
  }

  onPointerDown(event: MouseEvent): void {
    if (this.crystalSvc.canvasMode() !== 'Crystal Placement') return;
    const coords = this.getCanvasCoords(event);
    if (coords) this.crystalSvc.movePlacement(coords.x, coords.y);
  }

  onPointerMove(event: MouseEvent): void {
    const placement = this.crystalSvc.placementState();
    if (this.crystalSvc.canvasMode() !== 'Crystal Placement' || !placement?.isDragging) return;
    const coords = this.getCanvasCoords(event);
    if (coords) this.crystalSvc.movePlacement(coords.x, coords.y);
  }

  onPointerUp(event: MouseEvent): void {
    if (this.crystalSvc.canvasMode() !== 'Crystal Placement') return;
    const coords = this.getCanvasCoords(event);
    if (coords) this.crystalSvc.endDrag(coords.x, coords.y);
  }

  private getCanvasCoords(event: MouseEvent): { x: number; y: number } | null {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }
}
