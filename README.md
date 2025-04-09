# Angular Color Picker

⚠️ Note: This is a maintained fork of the original [ngx-color-picker](https://github.com/zefoy/ngx-color-picker), which is no longer actively maintained.
This fork — `ngx-color-picker-next` — aims to fix bugs, add support for newer Angular versions.

<a href="https://badge.fury.io/js/ngx-color-picker"><img src="https://badge.fury.io/js/ngx-color-picker.svg" align="right" alt="npm version" height="18"></a>

This is a simple color picker based on the cool angular2-color-picker by Alberplz.

### Quick links

[Example application](https://zefoy.github.io/ngx-color-picker/)
|
[StackBlitz example](https://stackblitz.com/github/zefoy/ngx-color-picker/tree/master)

### Building the library

```bash
yarn build
```

### Running the example

```bash
yarn start
```

### Installing and usage

```bash
yarn add ngx-color-picker
```

##### Import the library into your project:

```javascript
import { ColorPickerComponent, ColorPickerDirective } from 'ngx-color-picker';

@NgModule({
  // ...
  imports: [
    // ...
    ColorPickerComponent,
    ColorPickerDirective,
    // ...
  ]
})
```

##### Use it in your HTML template:

```html
<input [(colorPicker)]="color" [style.background]="color" />
```

```javascript
[colorPicker][cpWidth][cpHeight][cpToggle][cpDisabled][cpColorMode][ // The color to show in the color picker dialog. // Use this option to set color picker dialog width ('230px'). // Use this option to force color picker dialog height ('auto'). // Sets the default open / close state of the color picker (false). // Disables opening of the color picker dialog via toggle / events. // Dialog color mode: 'color', 'grayscale', 'presets' ('color').
  cpCmykEnabled
][cpOutputFormat][cpAlphaChannel][cpFallbackColor][cpPosition][ // Enables CMYK input format and color change event (false). // Output color format: 'auto', 'hex', 'rgba', 'hsla' ('auto'). // Alpha mode: 'enabled', 'disabled', 'always', 'forced' ('enabled'). // Used when the color is not well-formed or is undefined ('#000'). //  'top-left', 'top-right', 'bottom-left', 'bottom-right' ('auto'). // Dialog position: 'auto', 'top', 'bottom', 'left', 'right',
  cpPositionOffset
][cpPositionRelativeToArrow][cpPresetLabel][cpPresetColors][cpDisableInput][ // Dialog offset percentage relative to the directive element (0%). // Dialog position is calculated relative to dialog arrow (false). // Label text for the preset colors if any provided ('Preset colors'). // Array of preset colors to show in the color picker dialog ([]).
  cpDialogDisplay
][cpIgnoredElements][cpSaveClickOutside][cpCloseClickOutside][cpOKButton][ //   inline: dialog is shown permanently (static positioning). //   popup: dialog is shown as popup (fixed positioning). // Disables / hides the color input field from the dialog (false). // Dialog positioning mode: 'popup', 'inline' ('popup'). // Array of HTML elements that will be ignored when clicked ([]). // Save currently selected color when user clicks outside (true). // Close the color picker dialog when user clicks outside (true). // Show an OK / Apply button which saves the color (false).
  cpOKButtonText
][cpOKButtonClass][cpCancelButton][cpCancelButtonText][cpCancelButtonClass][ // Button label text shown inside the OK / Apply button ('OK'). // Additional class for customizing the OK / Apply button (''). // Show a Cancel / Reset button which resets the color (false). // Button label text shown inside the Cancel / Reset button ('Cancel'). // Additional class for customizing the Cancel / Reset button ('').
  cpAddColorButton
][cpAddColorButtonText][cpAddColorButtonClass][cpRemoveColorButtonClass][ // Show an Add Color button which add the color into preset (false). // Button label text shown inside the Add Color button ('Add color'). // Additional class for customizing the Add Color button (''). // Additional class for customizing the Remove Color button ('').
  cpPresetColorsClass
][cpMaxPresetColorsLength][cpPresetEmptyMessage][cpPresetEmptyMessageClass](
  // Create dialog component in the root view container (false).
  // Note: The root component needs to have public viewContainerRef.

  colorPickerOpen
)(
  // Current color value, send when dialog is opened (value: string).
  colorPickerClose
)(
  // Current color value, send when dialog is closed (value: string).

  colorPickerChange
)(
  // Changed color value, send when color is changed (value: string).
  colorPickerCancel
)(
  // Color select canceled, send when Cancel button is pressed (void).
  colorPickerSelect
)(
  // Selected color value, send when OK button is pressed (value: string).

  cpToggleChange
)(
  // Status of the dialog, send when dialog is opened / closed (open: boolean).

  cpInputChange
)(
  // Input name and its value, send when user changes color through inputs
  // ({input: string, value: number | string, color: string})

  cpSliderChange
)(
  // Slider name and its value, send when user changes color through slider
  //   ({slider: string, value: number | string, color: string})
  cpSliderDragStart
)(
  // Slider name and current color, send when slider dragging starts (mousedown,touchstart)
  //   ({slider: string, color: string})
  cpSliderDragEnd
)(
  // Slider name and current color, send when slider dragging ends (mouseup,touchend)
  //   ({slider: string, color: string})

  cpCmykColorChange
)(
  // Outputs the color as CMYK string if CMYK is enabled (value: string).

  cpPresetColorsChange
); // Preset colors, send when 'Add Color' button is pressed (value: array).
```

##### Available control / helper functions (provided by the directive):

```javascript
openDialog(); // Opens the color picker dialog if not already open.
closeDialog(); // Closes the color picker dialog if not already closed.
```
