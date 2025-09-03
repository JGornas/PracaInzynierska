import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button-component',
  standalone: true,
  templateUrl: './button-component.html',
  styleUrls: ['./button-component.scss'],
  imports: [CommonModule]
})
export class ButtonComponent {
  @Input() label: string = '';
  @Input() action: (() => void) | null = null;
  @Input() disabled: boolean = false;

  @Input() variant: 'blue-theme' | 'white-outline-theme' = 'blue-theme';

  @Output() loadingChange = new EventEmitter<boolean>();

  @ViewChild('submitButton', { static: true }) submitButton!: ElementRef<HTMLButtonElement>;

  private _loading = false;
  public get loading(): boolean {
    return this._loading;
  }
  public set loading(value: boolean) {
    this._loading = value;
    this.loadingChange.emit(value);
  }

  public async handleClick(): Promise<void> {
    if (this.loading || this.disabled || !this.action) {
      return;
    }

    try {
      this.loading = true;
      
      const result = await (this.action() as any);
      
    } catch (error) {
    } finally {
      this.loading = false;
    }
  }

  public get buttonClass(): string {
    const base = 'submit-btn';
    const variantClass = this.variant;
    const loadingClass = this.loading ? 'loading' : '';
    return [base, variantClass, loadingClass].filter(Boolean).join(' ');
  }

}
