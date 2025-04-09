import {
  Directive,
  OnChanges,
  Input,
  Output,
  EventEmitter,
  HostListener,
  ComponentRef,
  ElementRef,
  ViewContainerRef,
  inject,
  DestroyRef,
} from '@angular/core';

import { AlphaChannel, ColorMode, OutputFormat } from './helpers';
import { ColorPickerComponent } from './color-picker.component';

@Directive({
  selector: '[colorPicker]',
  exportAs: 'ngxColorPicker',
})
export class ColorPickerDirective implements OnChanges {
  private dialog: ColorPickerComponent | null = null;

  private dialogCreated = false;
  private ignoreChanges = false;

  private componentRef: ComponentRef<ColorPickerComponent> | null = null;

  @Input() colorPicker: string;

  @Input() cpWidth: string = '230px';
  @Input() cpHeight: string = 'auto';

  @Input() cpToggle = false;
  @Input() cpDisabled = false;

  @Input() cpIgnoredElements: HTMLElement[] = [];

  @Input() cpFallbackColor: string = '';

  @Input() cpColorMode: ColorMode = 'color';

  @Input() cpCmykEnabled = false;

  @Input() cpOutputFormat: OutputFormat = 'auto';
  @Input() cpAlphaChannel: AlphaChannel = 'enabled';

  @Input() cpDisableInput = false;

  @Input() cpDialogDisplay: string = 'popup';

  @Input() cpSaveClickOutside = true;
  @Input() cpCloseClickOutside = true;

  @Input() cpPosition: string = 'auto';
  @Input() cpPositionOffset: string = '0%';
  @Input() cpPositionRelativeToArrow = false;

  @Input() cpOKButton = false;
  @Input() cpOKButtonText: string = 'OK';
  @Input() cpOKButtonClass: string = 'cp-ok-button-class';

  @Input() cpCancelButton = false;
  @Input() cpCancelButtonText: string = 'Cancel';
  @Input() cpCancelButtonClass: string = 'cp-cancel-button-class';

  @Input() cpEyeDropper = false;

  @Input() cpPresetLabel: string = 'Preset colors';
  @Input() cpPresetColors: string[];
  @Input() cpPresetColorsClass: string = 'cp-preset-colors-class';
  @Input() cpMaxPresetColorsLength: number = 6;

  @Input() cpPresetEmptyMessage: string = 'No colors added';
  @Input() cpPresetEmptyMessageClass: string = 'preset-empty-message';

  @Input() cpAddColorButton = false;
  @Input() cpAddColorButtonText: string = 'Add color';
  @Input() cpAddColorButtonClass: string = 'cp-add-color-button-class';

  @Input() cpRemoveColorButtonClass: string = 'cp-remove-color-button-class';
  @Input() cpArrowPosition: number = 0;

  @Output() cpInputChange = new EventEmitter<{
    input: string;
    value: number | string;
    color: string;
  }>(true);

  @Output() cpToggleChange = new EventEmitter<boolean>(true);

  @Output() cpSliderChange = new EventEmitter<{
    slider: string;
    value: string | number;
    color: string;
  }>(true);
  @Output() cpSliderDragEnd = new EventEmitter<{
    slider: string;
    color: string;
  }>(true);
  @Output() cpSliderDragStart = new EventEmitter<{
    slider: string;
    color: string;
  }>(true);

  @Output() colorPickerOpen = new EventEmitter<string>(true);
  @Output() colorPickerClose = new EventEmitter<string>(true);

  @Output() colorPickerCancel = new EventEmitter<string>(true);
  @Output() colorPickerSelect = new EventEmitter<string>(true);
  @Output() colorPickerChange = new EventEmitter<string>(false);

  @Output() cpCmykColorChange = new EventEmitter<string>(true);

  @Output() cpPresetColorsChange = new EventEmitter<any>(true);

  @HostListener('click') handleClick(): void {
    this.inputFocus();
  }

  @HostListener('focus') handleFocus(): void {
    this.inputFocus();
  }

  @HostListener('input', ['$event']) handleInput(event: InputEvent): void {
    this.inputChange(event);
  }

  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly element =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.componentRef?.destroy();
      this.componentRef = this.dialog = null;
    });
  }

  ngOnChanges(changes: any): void {
    if (changes.cpToggle && !this.cpDisabled) {
      if (changes.cpToggle.currentValue) {
        this.openDialog();
      } else if (!changes.cpToggle.currentValue) {
        this.closeDialog();
      }
    }

    if (changes.colorPicker) {
      if (this.dialog && !this.ignoreChanges) {
        if (this.cpDialogDisplay === 'inline') {
          this.dialog.setInitialColor(changes.colorPicker.currentValue);
        }

        this.dialog.setColorFromString(changes.colorPicker.currentValue, false);
      }

      this.ignoreChanges = false;
    }

    if ((changes.cpPresetLabel || changes.cpPresetColors) && this.dialog) {
      this.dialog.setPresetConfig(this.cpPresetLabel, this.cpPresetColors);
    }
  }

  openDialog(): void {
    if (!this.dialogCreated) {
      const viewContainerRef = this.viewContainerRef;

      this.dialogCreated = true;

      this.componentRef =
        viewContainerRef.createComponent(ColorPickerComponent);

      this.componentRef.instance.setupDialog(
        this,
        this.element,
        this.colorPicker,
        this.cpWidth,
        this.cpHeight,
        this.cpDialogDisplay,
        this.cpFallbackColor,
        this.cpColorMode,
        this.cpCmykEnabled,
        this.cpAlphaChannel,
        this.cpOutputFormat,
        this.cpDisableInput,
        this.cpIgnoredElements,
        this.cpSaveClickOutside,
        this.cpCloseClickOutside,
        this.cpPosition,
        this.cpPositionOffset,
        this.cpPositionRelativeToArrow,
        this.cpPresetLabel,
        this.cpPresetColors,
        this.cpPresetColorsClass,
        this.cpMaxPresetColorsLength,
        this.cpPresetEmptyMessage,
        this.cpPresetEmptyMessageClass,
        this.cpOKButton,
        this.cpOKButtonClass,
        this.cpOKButtonText,
        this.cpCancelButton,
        this.cpCancelButtonClass,
        this.cpCancelButtonText,
        this.cpAddColorButton,
        this.cpAddColorButtonClass,
        this.cpAddColorButtonText,
        this.cpRemoveColorButtonClass,
        this.cpEyeDropper,
        this.element
      );

      this.dialog = this.componentRef.instance;

      if (this.viewContainerRef !== viewContainerRef) {
        this.componentRef.changeDetectorRef.detectChanges();
      }
    } else if (this.dialog) {
      // Update properties.
      this.componentRef.instance.cpAlphaChannel = this.cpAlphaChannel;

      // Open dialog.
      this.dialog.openDialog(this.colorPicker);
    }
  }

  closeDialog(): void {
    if (this.cpDialogDisplay === 'popup') {
      this.dialog?.closeDialog();
    }
  }

  cmykChanged(value: string): void {
    this.cpCmykColorChange.emit(value);
  }

  stateChanged(state: boolean): void {
    this.cpToggleChange.emit(state);

    if (state) {
      this.colorPickerOpen.emit(this.colorPicker);
    } else {
      this.colorPickerClose.emit(this.colorPicker);
    }
  }

  colorChanged(value: string, ignore = true): void {
    this.ignoreChanges = ignore;

    this.colorPickerChange.emit(value);
  }

  colorSelected(value: string): void {
    this.colorPickerSelect.emit(value);
  }

  colorCanceled(): void {
    this.colorPickerCancel.emit();
  }

  inputFocus(): void {
    const element = this.element;

    const ignored = this.cpIgnoredElements.filter((item) => item === element);

    if (this.cpDisabled || ignored.length) return;

    if (element === document.activeElement) {
      this.openDialog();
    } else if (!this.dialog || !this.dialog.shown()) {
      this.openDialog();
    } else {
      this.closeDialog();
    }
  }

  inputChange(event: InputEvent): void {
    const { value } = <HTMLInputElement>event.target;

    if (this.dialog) {
      this.dialog.setColorFromString(value, true);
    } else {
      this.colorPicker = value;
      this.colorPickerChange.emit(this.colorPicker);
    }
  }

  inputChanged(event: any): void {
    this.cpInputChange.emit(event);
  }

  sliderChanged(event: any): void {
    this.cpSliderChange.emit(event);
  }

  sliderDragEnd(event: { slider: string; color: string }): void {
    this.cpSliderDragEnd.emit(event);
  }

  sliderDragStart(event: { slider: string; color: string }): void {
    this.cpSliderDragStart.emit(event);
  }

  presetColorsChanged(value: any[]): void {
    this.cpPresetColorsChange.emit(value);
  }
}
