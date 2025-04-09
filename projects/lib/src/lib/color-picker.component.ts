import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  HostListener,
  ViewEncapsulation,
  ElementRef,
  ChangeDetectorRef,
  NgZone,
  viewChild,
  effect,
  inject,
  DestroyRef,
} from '@angular/core';

import {
  calculateAutoPositioning,
  SliderDirective,
  TextDirective,
} from './helpers';

import { ColorFormats, Cmyk, Hsla, Hsva, Rgba } from './formats';
import {
  AlphaChannel,
  OutputFormat,
  SliderDimension,
  SliderPosition,
} from './helpers';

import { ColorPickerService } from './color-picker.service';

@Component({
  selector: 'color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.css'],
  encapsulation: ViewEncapsulation.None,
  imports: [SliderDirective, TextDirective],
})
export class ColorPickerComponent implements OnInit, OnDestroy, AfterViewInit {
  private cmyk: Cmyk;
  private hsva: Hsva;

  private width: number;
  private height: number;

  private cmykColor: string;
  private outputColor: string;
  private initialColor: string;
  private fallbackColor: string;

  private listenerResize: any;
  private listenerMouseDown: EventListener;

  private directiveInstance: any;

  private sliderH: number;
  private sliderDimMax: SliderDimension;
  private directiveElementRef: ElementRef;

  private dialogArrowSize: number = 10;
  private dialogArrowOffset: number = 15;

  private dialogInputFields: ColorFormats[] = [
    ColorFormats.HEX,
    ColorFormats.RGBA,
    ColorFormats.HSLA,
    ColorFormats.CMYK,
  ];

  private useRootViewContainer: boolean = false;

  show: boolean;
  hidden: boolean;

  top: number;
  left: number;
  position: string;

  format: ColorFormats;
  slider: SliderPosition;

  hexText: string;
  hexAlpha: number;

  cmykText: Cmyk;
  hslaText: Hsla;
  rgbaText: Rgba;

  arrowTop: number;

  selectedColor: string;
  hueSliderColor: string;
  alphaSliderColor: string;

  cpWidth: number;
  cpHeight: number;

  cpColorMode: number;

  cpCmykEnabled: boolean;

  cpAlphaChannel: AlphaChannel;
  cpOutputFormat: OutputFormat;

  cpDisableInput: boolean;
  cpDialogDisplay: string;

  cpIgnoredElements: any;

  cpSaveClickOutside: boolean;
  cpCloseClickOutside: boolean;

  cpPosition: string;
  cpUsePosition: string;
  cpPositionOffset: number;

  cpOKButton: boolean;
  cpOKButtonText: string;
  cpOKButtonClass: string;

  cpCancelButton: boolean;
  cpCancelButtonText: string;
  cpCancelButtonClass: string;

  cpEyeDropper: boolean;
  eyeDropperSupported: boolean;

  cpPresetLabel: string;
  cpPresetColors: string[];
  cpPresetColorsClass: string;
  cpMaxPresetColorsLength: number;

  cpPresetEmptyMessage: string;
  cpPresetEmptyMessageClass: string;

  cpAddColorButton: boolean;
  cpAddColorButtonText: string;
  cpAddColorButtonClass: string;
  cpRemoveColorButtonClass: string;
  cpArrowPosition: number;

  cpTriggerElement: ElementRef;

  readonly dialogPopup =
    viewChild.required<ElementRef<HTMLElement>>('dialogPopup');

  @ViewChild('hueSlider', { static: true }) hueSlider: ElementRef;
  @ViewChild('alphaSlider', { static: true }) alphaSlider: ElementRef;

  @HostListener('document:keyup.esc', ['$event']) handleEsc(event: any): void {
    if (this.show && this.cpDialogDisplay === 'popup') {
      this.onCancelColor(event);
    }
  }

  @HostListener('document:keyup.enter', ['$event']) handleEnter(
    event: any
  ): void {
    if (this.show && this.cpDialogDisplay === 'popup') {
      this.onAcceptColor(event);
    }
  }

  private readonly ngZone = inject(NgZone);
  private readonly ref = inject(ChangeDetectorRef);
  private readonly element =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly destroyRef = inject(DestroyRef);

  private readonly service = inject(ColorPickerService);

  constructor() {
    this.eyeDropperSupported = 'EyeDropper' in document;

    effect(() => {
      const { nativeElement } = this.dialogPopup();
      this.ngZone.runOutsideAngular(() => {
        const onClick = (event: MouseEvent) => event.stopPropagation();
        nativeElement.addEventListener('click', onClick);
        this.destroyRef.onDestroy(() =>
          nativeElement.removeEventListener('click', onClick)
        );
      });
    });
  }

  ngOnInit(): void {
    this.slider = new SliderPosition(0, 0, 0, 0);

    const hueWidth = this.hueSlider.nativeElement.offsetWidth || 140;
    const alphaWidth = this.alphaSlider.nativeElement.offsetWidth || 140;

    this.sliderDimMax = new SliderDimension(
      hueWidth,
      this.cpWidth,
      130,
      alphaWidth
    );

    if (this.cpCmykEnabled) {
      this.format = ColorFormats.CMYK;
    } else if (this.cpOutputFormat === 'rgba') {
      this.format = ColorFormats.RGBA;
    } else if (this.cpOutputFormat === 'hsla') {
      this.format = ColorFormats.HSLA;
    } else {
      this.format = ColorFormats.HEX;
    }

    this.listenerMouseDown = (event: MouseEvent) => {
      this.onMouseDown(event);
    };
    this.listenerResize = () => {
      this.onResize();
    };

    this.openDialog(this.initialColor, false);
  }

  ngOnDestroy(): void {
    this.closeDialog();
  }

  ngAfterViewInit(): void {
    if (this.cpWidth !== 230 || this.cpDialogDisplay === 'inline') {
      const hueWidth = this.hueSlider.nativeElement.offsetWidth || 140;
      const alphaWidth = this.alphaSlider.nativeElement.offsetWidth || 140;

      this.sliderDimMax = new SliderDimension(
        hueWidth,
        this.cpWidth,
        130,
        alphaWidth
      );

      this.updateColorPicker(false);

      this.ref.detectChanges();
    }
  }

  openDialog(color: any, emit: boolean = true): void {
    this.service.setActive(this);

    if (!this.width) {
      this.cpWidth = this.directiveElementRef.nativeElement.offsetWidth;
    }

    if (!this.height) {
      this.height = 320;
    }

    this.setInitialColor(color);

    this.setColorFromString(color, emit);

    this.openColorPicker();
  }

  closeDialog(): void {
    this.closeColorPicker();
  }

  setupDialog(
    instance: any,
    elementRef: ElementRef,
    color: any,
    cpWidth: string,
    cpHeight: string,
    cpDialogDisplay: string,
    cpFallbackColor: string,
    cpColorMode: string,
    cpCmykEnabled: boolean,
    cpAlphaChannel: AlphaChannel,
    cpOutputFormat: OutputFormat,
    cpDisableInput: boolean,
    cpIgnoredElements: any,
    cpSaveClickOutside: boolean,
    cpCloseClickOutside: boolean,
    cpUseRootViewContainer: boolean,
    cpPosition: string,
    cpPositionOffset: string,
    cpPositionRelativeToArrow: boolean,
    cpPresetLabel: string,
    cpPresetColors: string[],
    cpPresetColorsClass: string,
    cpMaxPresetColorsLength: number,
    cpPresetEmptyMessage: string,
    cpPresetEmptyMessageClass: string,
    cpOKButton: boolean,
    cpOKButtonClass: string,
    cpOKButtonText: string,
    cpCancelButton: boolean,
    cpCancelButtonClass: string,
    cpCancelButtonText: string,
    cpAddColorButton: boolean,
    cpAddColorButtonClass: string,
    cpAddColorButtonText: string,
    cpRemoveColorButtonClass: string,
    cpEyeDropper: boolean,
    cpTriggerElement: ElementRef
  ): void {
    this.setInitialColor(color);

    this.setColorMode(cpColorMode);

    this.directiveInstance = instance;
    this.directiveElementRef = elementRef;

    this.cpDisableInput = cpDisableInput;

    this.cpCmykEnabled = cpCmykEnabled;
    this.cpAlphaChannel = cpAlphaChannel;
    this.cpOutputFormat = cpOutputFormat;

    this.cpDialogDisplay = cpDialogDisplay;

    this.cpIgnoredElements = cpIgnoredElements;

    this.cpSaveClickOutside = cpSaveClickOutside;
    this.cpCloseClickOutside = cpCloseClickOutside;

    this.useRootViewContainer = cpUseRootViewContainer;

    this.width = this.cpWidth = parseInt(cpWidth, 10);
    this.height = this.cpHeight = parseInt(cpHeight, 10);

    this.cpPosition = cpPosition;
    this.cpPositionOffset = parseInt(cpPositionOffset, 10);

    this.cpOKButton = cpOKButton;
    this.cpOKButtonText = cpOKButtonText;
    this.cpOKButtonClass = cpOKButtonClass;

    this.cpCancelButton = cpCancelButton;
    this.cpCancelButtonText = cpCancelButtonText;
    this.cpCancelButtonClass = cpCancelButtonClass;

    this.cpEyeDropper = cpEyeDropper;

    this.fallbackColor = cpFallbackColor || '#fff';

    this.setPresetConfig(cpPresetLabel, cpPresetColors);

    this.cpPresetColorsClass = cpPresetColorsClass;
    this.cpMaxPresetColorsLength = cpMaxPresetColorsLength;
    this.cpPresetEmptyMessage = cpPresetEmptyMessage;
    this.cpPresetEmptyMessageClass = cpPresetEmptyMessageClass;

    this.cpAddColorButton = cpAddColorButton;
    this.cpAddColorButtonText = cpAddColorButtonText;
    this.cpAddColorButtonClass = cpAddColorButtonClass;
    this.cpRemoveColorButtonClass = cpRemoveColorButtonClass;

    this.cpTriggerElement = cpTriggerElement;

    if (!cpPositionRelativeToArrow) {
      this.dialogArrowOffset = 0;
    }

    if (cpDialogDisplay === 'inline') {
      this.dialogArrowSize = 0;
      this.dialogArrowOffset = 0;
    }

    if (
      cpOutputFormat === 'hex' &&
      cpAlphaChannel !== 'always' &&
      cpAlphaChannel !== 'forced'
    ) {
      this.cpAlphaChannel = 'disabled';
    }
  }

  setColorMode(mode: string): void {
    switch (mode.toString().toUpperCase()) {
      case '1':
      case 'C':
      case 'COLOR':
        this.cpColorMode = 1;
        break;
      case '2':
      case 'G':
      case 'GRAYSCALE':
        this.cpColorMode = 2;
        break;
      case '3':
      case 'P':
      case 'PRESETS':
        this.cpColorMode = 3;
        break;
      default:
        this.cpColorMode = 1;
    }
  }

  setInitialColor(color: any): void {
    this.initialColor = color;
  }

  setPresetConfig(cpPresetLabel: string, cpPresetColors: string[]): void {
    this.cpPresetLabel = cpPresetLabel;
    this.cpPresetColors = cpPresetColors;
  }

  setColorFromString(
    value: string,
    emit: boolean = true,
    update: boolean = true
  ): void {
    let hsva: Hsva | null;

    if (this.cpAlphaChannel === 'always' || this.cpAlphaChannel === 'forced') {
      hsva = this.service.stringToHsva(value, true);

      if (!hsva && !this.hsva) {
        hsva = this.service.stringToHsva(value, false);
      }
    } else {
      hsva = this.service.stringToHsva(value, false);
    }

    if (!hsva && !this.hsva) {
      hsva = this.service.stringToHsva(this.fallbackColor, false);
    }

    if (hsva) {
      this.hsva = hsva;

      this.sliderH = this.hsva.h;

      if (this.cpOutputFormat === 'hex' && this.cpAlphaChannel === 'disabled') {
        this.hsva.a = 1;
      }

      this.updateColorPicker(emit, update);
    }
  }

  onResize(): void {
    if (this.position === 'fixed') {
      this.setDialogPosition();
    } else if (this.cpDialogDisplay !== 'inline') {
      this.closeColorPicker();
    }
  }

  onDragEnd(slider: string): void {
    this.directiveInstance.sliderDragEnd({
      slider: slider,
      color: this.outputColor,
    });
  }

  onDragStart(slider: string): void {
    this.directiveInstance.sliderDragStart({
      slider: slider,
      color: this.outputColor,
    });
  }

  onMouseDown(event: MouseEvent): void {
    const isOutsideClick =
      this.show &&
      this.cpDialogDisplay === 'popup' &&
      event.target !== this.directiveElementRef.nativeElement &&
      !isDescendant(this.element, event.target) &&
      !isDescendant(this.directiveElementRef.nativeElement, event.target) &&
      !this.cpIgnoredElements.includes(event.target);

    if (!isOutsideClick) return;

    this.ngZone.run(() => {
      if (this.cpSaveClickOutside) {
        // Save selected color on outside click
        this.directiveInstance.colorSelected(this.outputColor);
      } else {
        // Revert to initial color
        this.hsva = null;
        this.setColorFromString(this.initialColor, false);

        if (this.cpCmykEnabled) {
          this.directiveInstance.cmykChanged(this.cmykColor);
        }

        this.directiveInstance.colorChanged(this.initialColor);
        this.directiveInstance.colorCanceled();
      }

      if (this.cpCloseClickOutside) {
        this.closeColorPicker();
      }
    });
  }

  onAcceptColor(event: Event): void {
    event.stopPropagation();

    if (this.outputColor) {
      this.directiveInstance.colorSelected(this.outputColor);
    }

    if (this.cpDialogDisplay === 'popup') {
      this.closeColorPicker();
    }
  }

  onCancelColor(event: Event): void {
    this.hsva = null;

    event.stopPropagation();

    this.directiveInstance.colorCanceled();

    this.setColorFromString(this.initialColor, true);

    if (this.cpDialogDisplay === 'popup') {
      if (this.cpCmykEnabled) {
        this.directiveInstance.cmykChanged(this.cmykColor);
      }

      this.directiveInstance.colorChanged(this.initialColor, true);

      this.closeColorPicker();
    }
  }

  onEyeDropper(): void {
    if (!this.eyeDropperSupported) return;
    const eyeDropper = new (window as any).EyeDropper();
    eyeDropper.open().then((eyeDropperResult: { sRGBHex: string }) => {
      this.setColorFromString(eyeDropperResult.sRGBHex, true);
    });
  }

  onFormatToggle(change: number): void {
    const availableFormats =
      this.dialogInputFields.length - (this.cpCmykEnabled ? 0 : 1);

    const nextFormat =
      (((this.dialogInputFields.indexOf(this.format) + change) %
        availableFormats) +
        availableFormats) %
      availableFormats;

    this.format = this.dialogInputFields[nextFormat];
  }

  onColorChange(value: {
    s: number;
    v: number;
    rgX: number;
    rgY: number;
  }): void {
    this.hsva.s = value.s / value.rgX;
    this.hsva.v = value.v / value.rgY;

    this.updateColorPicker();

    this.directiveInstance.sliderChanged({
      slider: 'lightness',
      value: this.hsva.v,
      color: this.outputColor,
    });

    this.directiveInstance.sliderChanged({
      slider: 'saturation',
      value: this.hsva.s,
      color: this.outputColor,
    });
  }

  onHueChange(value: { v: number; rgX: number }): void {
    this.hsva.h = value.v / value.rgX;
    this.sliderH = this.hsva.h;

    this.updateColorPicker();

    this.directiveInstance.sliderChanged({
      slider: 'hue',
      value: this.hsva.h,
      color: this.outputColor,
    });
  }

  onValueChange(value: { v: number; rgX: number }): void {
    this.hsva.v = value.v / value.rgX;

    this.updateColorPicker();

    this.directiveInstance.sliderChanged({
      slider: 'value',
      value: this.hsva.v,
      color: this.outputColor,
    });
  }

  onAlphaChange(value: { v: number; rgX: number }): void {
    this.hsva.a = value.v / value.rgX;

    this.updateColorPicker();

    this.directiveInstance.sliderChanged({
      slider: 'alpha',
      value: this.hsva.a,
      color: this.outputColor,
    });
  }

  onHexInput(value: string | null): void {
    if (value === null) {
      this.updateColorPicker();
    } else {
      if (value && value[0] !== '#') {
        value = '#' + value;
      }

      let validHex = /^#([a-f0-9]{3}|[a-f0-9]{6})$/gi;

      if (this.cpAlphaChannel === 'always') {
        validHex = /^#([a-f0-9]{3}|[a-f0-9]{6}|[a-f0-9]{8})$/gi;
      }

      const valid = validHex.test(value);

      if (valid) {
        if (value.length < 5) {
          value =
            '#' +
            value
              .substring(1)
              .split('')
              .map((c) => c + c)
              .join('');
        }

        if (this.cpAlphaChannel === 'forced') {
          value += Math.round(this.hsva.a * 255).toString(16);
        }

        this.setColorFromString(value, true, false);
      }

      this.directiveInstance.inputChanged({
        input: 'hex',
        valid: valid,
        value: value,
        color: this.outputColor,
      });
    }
  }

  onRedInput(value: { v: number; rg: number }): void {
    const rgba = this.service.hsvaToRgba(this.hsva);

    const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;

    if (valid) {
      rgba.r = value.v / value.rg;

      this.hsva = this.service.rgbaToHsva(rgba);

      this.sliderH = this.hsva.h;

      this.updateColorPicker();
    }

    this.directiveInstance.inputChanged({
      input: 'red',
      valid: valid,
      value: rgba.r,
      color: this.outputColor,
    });
  }

  onBlueInput(value: { v: number; rg: number }): void {
    const rgba = this.service.hsvaToRgba(this.hsva);

    const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;

    if (valid) {
      rgba.b = value.v / value.rg;

      this.hsva = this.service.rgbaToHsva(rgba);

      this.sliderH = this.hsva.h;

      this.updateColorPicker();
    }

    this.directiveInstance.inputChanged({
      input: 'blue',
      valid: valid,
      value: rgba.b,
      color: this.outputColor,
    });
  }

  onGreenInput(value: { v: number; rg: number }): void {
    const rgba = this.service.hsvaToRgba(this.hsva);

    const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;

    if (valid) {
      rgba.g = value.v / value.rg;

      this.hsva = this.service.rgbaToHsva(rgba);

      this.sliderH = this.hsva.h;

      this.updateColorPicker();
    }

    this.directiveInstance.inputChanged({
      input: 'green',
      valid: valid,
      value: rgba.g,
      color: this.outputColor,
    });
  }

  onHueInput(value: { v: number; rg: number }) {
    const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;

    if (valid) {
      this.hsva.h = value.v / value.rg;

      this.sliderH = this.hsva.h;

      this.updateColorPicker();
    }

    this.directiveInstance.inputChanged({
      input: 'hue',
      valid: valid,
      value: this.hsva.h,
      color: this.outputColor,
    });
  }

  onValueInput(value: { v: number; rg: number }): void {
    const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;

    if (valid) {
      this.hsva.v = value.v / value.rg;

      this.updateColorPicker();
    }

    this.directiveInstance.inputChanged({
      input: 'value',
      valid: valid,
      value: this.hsva.v,
      color: this.outputColor,
    });
  }

  onAlphaInput(value: { v: number; rg: number }): void {
    const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;

    if (valid) {
      this.hsva.a = value.v / value.rg;

      this.updateColorPicker();
    }

    this.directiveInstance.inputChanged({
      input: 'alpha',
      valid: valid,
      value: this.hsva.a,
      color: this.outputColor,
    });
  }

  onLightnessInput(value: { v: number; rg: number }): void {
    const hsla = this.service.hsva2hsla(this.hsva);

    const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;

    if (valid) {
      hsla.l = value.v / value.rg;

      this.hsva = this.service.hsla2hsva(hsla);

      this.sliderH = this.hsva.h;

      this.updateColorPicker();
    }

    this.directiveInstance.inputChanged({
      input: 'lightness',
      valid: valid,
      value: hsla.l,
      color: this.outputColor,
    });
  }

  onSaturationInput(value: { v: number; rg: number }): void {
    const hsla = this.service.hsva2hsla(this.hsva);

    const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;

    if (valid) {
      hsla.s = value.v / value.rg;

      this.hsva = this.service.hsla2hsva(hsla);

      this.sliderH = this.hsva.h;

      this.updateColorPicker();
    }

    this.directiveInstance.inputChanged({
      input: 'saturation',
      valid: valid,
      value: hsla.s,
      color: this.outputColor,
    });
  }

  onCyanInput(value: { v: number; rg: number }): void {
    const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;

    if (valid) {
      this.cmyk.c = value.v;

      this.updateColorPicker(false, true, true);
    }

    this.directiveInstance.inputChanged({
      input: 'cyan',
      valid: true,
      value: this.cmyk.c,
      color: this.outputColor,
    });
  }

  onMagentaInput(value: { v: number; rg: number }): void {
    const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;

    if (valid) {
      this.cmyk.m = value.v;

      this.updateColorPicker(false, true, true);
    }

    this.directiveInstance.inputChanged({
      input: 'magenta',
      valid: true,
      value: this.cmyk.m,
      color: this.outputColor,
    });
  }

  onYellowInput(value: { v: number; rg: number }): void {
    const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;

    if (valid) {
      this.cmyk.y = value.v;

      this.updateColorPicker(false, true, true);
    }

    this.directiveInstance.inputChanged({
      input: 'yellow',
      valid: true,
      value: this.cmyk.y,
      color: this.outputColor,
    });
  }

  onBlackInput(value: { v: number; rg: number }): void {
    const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;

    if (valid) {
      this.cmyk.k = value.v;

      this.updateColorPicker(false, true, true);
    }

    this.directiveInstance.inputChanged({
      input: 'black',
      valid: true,
      value: this.cmyk.k,
      color: this.outputColor,
    });
  }

  onAddPresetColor(event: any, value: string): void {
    event.stopPropagation();

    if (!this.cpPresetColors.filter((color) => color === value).length) {
      this.cpPresetColors = this.cpPresetColors.concat(value);

      this.directiveInstance.presetColorsChanged(this.cpPresetColors);
    }
  }

  onRemovePresetColor(event: any, value: string): void {
    event.stopPropagation();

    this.cpPresetColors = this.cpPresetColors.filter(
      (color) => color !== value
    );

    this.directiveInstance.presetColorsChanged(this.cpPresetColors);
  }

  // Private helper functions for the color picker dialog status

  private openColorPicker(): void {
    if (!this.show) {
      this.show = true;
      this.hidden = true;

      setTimeout(() => {
        this.hidden = false;

        this.setDialogPosition();

        this.ref.detectChanges();
      }, 0);

      this.directiveInstance.stateChanged(true);

      // The change detection should be run on `mousedown` event only when the condition
      // is met within the `onMouseDown` method.
      this.ngZone.runOutsideAngular(() => {
        document.addEventListener('touchstart', this.listenerMouseDown);
        document.addEventListener('mousedown', this.listenerMouseDown);
      });

      window.addEventListener('resize', this.listenerResize);
    }
  }

  private closeColorPicker(): void {
    if (this.show) {
      this.service.setInactive();

      this.show = false;

      this.directiveInstance.stateChanged(false);

      document.removeEventListener('touchstart', this.listenerMouseDown);
      document.removeEventListener('mousedown', this.listenerMouseDown);

      window.removeEventListener('resize', this.listenerResize);

      if (!this.ref['destroyed']) {
        this.ref.detectChanges();
      }
    }
  }

  private updateColorPicker(
    emit: boolean = true,
    update: boolean = true,
    cmykInput: boolean = false
  ): void {
    if (this.sliderDimMax) {
      if (this.cpColorMode === 2) {
        this.hsva.s = 0;
      }

      let hue: Rgba, hsla: Hsla, rgba: Rgba;

      const lastOutput = this.outputColor;

      hsla = this.service.hsva2hsla(this.hsva);

      if (!this.cpCmykEnabled) {
        rgba = this.service.denormalizeRGBA(this.service.hsvaToRgba(this.hsva));
      } else {
        if (!cmykInput) {
          rgba = this.service.hsvaToRgba(this.hsva);

          this.cmyk = this.service.denormalizeCMYK(
            this.service.rgbaToCmyk(rgba)
          );
        } else {
          rgba = this.service.cmykToRgb(this.service.normalizeCMYK(this.cmyk));

          this.hsva = this.service.rgbaToHsva(rgba);
        }

        rgba = this.service.denormalizeRGBA(rgba);

        this.sliderH = this.hsva.h;
      }

      hue = this.service.denormalizeRGBA(
        this.service.hsvaToRgba(new Hsva(this.sliderH || this.hsva.h, 1, 1, 1))
      );

      if (update) {
        this.hslaText = new Hsla(
          Math.round(hsla.h * 360),
          Math.round(hsla.s * 100),
          Math.round(hsla.l * 100),
          Math.round(hsla.a * 100) / 100
        );

        this.rgbaText = new Rgba(
          rgba.r,
          rgba.g,
          rgba.b,
          Math.round(rgba.a * 100) / 100
        );

        if (this.cpCmykEnabled) {
          this.cmykText = new Cmyk(
            this.cmyk.c,
            this.cmyk.m,
            this.cmyk.y,
            this.cmyk.k,
            Math.round(this.cmyk.a * 100) / 100
          );
        }

        const allowHex8 = this.cpAlphaChannel === 'always';

        this.hexText = this.service.rgbaToHex(rgba, allowHex8);
        this.hexAlpha = this.rgbaText.a;
      }

      if (this.cpOutputFormat === 'auto') {
        if (
          this.format !== ColorFormats.RGBA &&
          this.format !== ColorFormats.CMYK &&
          this.format !== ColorFormats.HSLA
        ) {
          if (this.hsva.a < 1) {
            this.format =
              this.hsva.a < 1 ? ColorFormats.RGBA : ColorFormats.HEX;
          }
        }
      }

      this.hueSliderColor = 'rgb(' + hue.r + ',' + hue.g + ',' + hue.b + ')';
      this.alphaSliderColor =
        'rgb(' + rgba.r + ',' + rgba.g + ',' + rgba.b + ')';

      this.outputColor = this.service.outputFormat(
        this.hsva,
        this.cpOutputFormat,
        this.cpAlphaChannel
      );
      this.selectedColor = this.service.outputFormat(this.hsva, 'rgba', null);

      if (this.format !== ColorFormats.CMYK) {
        this.cmykColor = '';
      } else {
        if (
          this.cpAlphaChannel === 'always' ||
          this.cpAlphaChannel === 'enabled' ||
          this.cpAlphaChannel === 'forced'
        ) {
          const alpha = Math.round(this.cmyk.a * 100) / 100;

          this.cmykColor = `cmyka(${this.cmyk.c},${this.cmyk.m},${this.cmyk.y},${this.cmyk.k},${alpha})`;
        } else {
          this.cmykColor = `cmyk(${this.cmyk.c},${this.cmyk.m},${this.cmyk.y},${this.cmyk.k})`;
        }
      }

      this.slider = new SliderPosition(
        (this.sliderH || this.hsva.h) * this.sliderDimMax.h - 8,
        this.hsva.s * this.sliderDimMax.s - 8,
        (1 - this.hsva.v) * this.sliderDimMax.v - 8,
        this.hsva.a * this.sliderDimMax.a - 8
      );

      if (emit && lastOutput !== this.outputColor) {
        if (this.cpCmykEnabled) {
          this.directiveInstance.cmykChanged(this.cmykColor);
        }

        this.directiveInstance.colorChanged(this.outputColor);
      }
    }
  }

  // Private helper functions for the color picker dialog positioning

  private setDialogPosition(): void {
    if (this.cpDialogDisplay === 'inline') {
      this.position = 'relative';
    } else {
      let position = 'static',
        transform = '',
        style;

      let parentNode: any = null,
        transformNode: any = null;

      let node = this.directiveElementRef.nativeElement.parentNode;

      const dialogHeight = this.dialogPopup().nativeElement.offsetHeight;

      while (node !== null && node.tagName !== 'HTML') {
        style = window.getComputedStyle(node);
        position = style.getPropertyValue('position');
        transform = style.getPropertyValue('transform');

        if (position !== 'static' && parentNode === null) {
          parentNode = node;
        }

        if (transform && transform !== 'none' && transformNode === null) {
          transformNode = node;
        }

        if (position === 'fixed') {
          parentNode = transformNode;

          break;
        }

        node = node.parentNode;
      }

      const boxDirective = createDialogBox(
        this.directiveElementRef.nativeElement,
        position !== 'fixed'
      );

      if (
        this.useRootViewContainer ||
        (position === 'fixed' &&
          (!parentNode || parentNode instanceof HTMLUnknownElement))
      ) {
        this.top = boxDirective.top;
        this.left = boxDirective.left;
      } else {
        if (parentNode === null) {
          parentNode = node;
        }

        const boxParent = createDialogBox(parentNode, position !== 'fixed');

        this.top = boxDirective.top - boxParent.top;
        this.left = boxDirective.left - boxParent.left;
      }

      if (position === 'fixed') {
        this.position = 'fixed';
      }

      let usePosition = this.cpPosition;

      const dialogBounds =
        this.dialogPopup().nativeElement.getBoundingClientRect();
      if (this.cpPosition === 'auto') {
        const triggerBounds =
          this.cpTriggerElement.nativeElement.getBoundingClientRect();
        usePosition = calculateAutoPositioning(dialogBounds, triggerBounds);
      }

      this.arrowTop = usePosition === 'top' ? dialogHeight - 1 : undefined;
      this.cpArrowPosition = undefined;

      switch (usePosition) {
        case 'top':
          this.top -= dialogHeight + this.dialogArrowSize;
          this.left +=
            (this.cpPositionOffset / 100) * boxDirective.width -
            this.dialogArrowOffset;
          break;
        case 'bottom':
          this.top += boxDirective.height + this.dialogArrowSize;
          this.left +=
            (this.cpPositionOffset / 100) * boxDirective.width -
            this.dialogArrowOffset;
          break;
        case 'top-left':
        case 'left-top':
          this.top -=
            dialogHeight -
            boxDirective.height +
            (boxDirective.height * this.cpPositionOffset) / 100;
          this.left -=
            this.cpWidth + this.dialogArrowSize - 2 - this.dialogArrowOffset;
          break;
        case 'top-right':
        case 'right-top':
          this.top -=
            dialogHeight -
            boxDirective.height +
            (boxDirective.height * this.cpPositionOffset) / 100;
          this.left +=
            boxDirective.width +
            this.dialogArrowSize -
            2 -
            this.dialogArrowOffset;
          break;
        case 'left':
        case 'bottom-left':
        case 'left-bottom':
          this.top +=
            (boxDirective.height * this.cpPositionOffset) / 100 -
            this.dialogArrowOffset;
          this.left -= this.cpWidth + this.dialogArrowSize - 2;
          break;
        case 'right':
        case 'bottom-right':
        case 'right-bottom':
        default:
          this.top +=
            (boxDirective.height * this.cpPositionOffset) / 100 -
            this.dialogArrowOffset;
          this.left += boxDirective.width + this.dialogArrowSize - 2;
          break;
      }

      const windowInnerHeight = window.innerHeight;
      const windowInnerWidth = window.innerWidth;
      const elRefClientRect = this.element.getBoundingClientRect();
      const bottom = this.top + dialogBounds.height;
      if (bottom > windowInnerHeight) {
        this.top = windowInnerHeight - dialogBounds.height;
        this.cpArrowPosition = elRefClientRect.x / 2 - 20;
      }
      const right = this.left + dialogBounds.width;
      if (right > windowInnerWidth) {
        this.left = windowInnerWidth - dialogBounds.width;
        this.cpArrowPosition = elRefClientRect.x / 2 - 20;
      }

      this.cpUsePosition = usePosition;
    }
  }
}

function isDescendant(parent: any, child: any): boolean {
  let node: any = child.parentNode;

  while (node !== null) {
    if (node === parent) {
      return true;
    }

    node = node.parentNode;
  }

  return false;
}

function createDialogBox(element: any, offset: boolean): any {
  const { top, left } = element.getBoundingClientRect();
  return {
    top: top + (offset ? window.pageYOffset : 0),
    left: left + (offset ? window.pageXOffset : 0),
    width: element.offsetWidth,
    height: element.offsetHeight,
  };
}
