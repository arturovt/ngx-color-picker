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
yarn add ngx-color-picker-next
```

##### Import the library into your project:

```javascript
import { ColorPickerComponent, ColorPickerDirective } from 'ngx-color-picker-next';

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

Here’s your code neatly transformed into a **markdown table** with input/output options and their descriptions:

---

| **Property / Event**        | **Description**                                                              |
| --------------------------- | ---------------------------------------------------------------------------- |
| `colorPicker`               | The color to show in the color picker dialog.                                |
| `cpWidth`                   | Set color picker dialog width (`'230px'`).                                   |
| `cpHeight`                  | Force color picker dialog height (`'auto'`).                                 |
| `cpToggle`                  | Sets the default open/close state of the color picker (`false`).             |
| `cpDisabled`                | Disables opening the color picker via toggle/events.                         |
| `cpColorMode`               | Dialog color mode: `'color'`, `'grayscale'`, `'presets'` (`'color'`).        |
| `cpCmykEnabled`             | Enables CMYK input format and color change event (`false`).                  |
| `cpOutputFormat`            | Output color format: `'auto'`, `'hex'`, `'rgba'`, `'hsla'` (`'auto'`).       |
| `cpAlphaChannel`            | Alpha mode: `'enabled'`, `'disabled'`, `'always'`, `'forced'` (`'enabled'`). |
| `cpFallbackColor`           | Used when the color is invalid or undefined (`'#000'`).                      |
| `cpPosition`                | Dialog position: `'auto'`, `'top'`, `'bottom'`, `'left'`, `'right'`.         |
| `cpPositionOffset`          | Dialog offset % relative to directive element (`0%`).                        |
| `cpPositionRelativeToArrow` | Position is relative to dialog arrow (`false`).                              |
| `cpPresetLabel`             | Label for preset colors (`'Preset colors'`).                                 |
| `cpPresetColors`            | Array of preset colors to show (`[]`).                                       |
| `cpDisableInput`            | Disables/hides the color input field (`false`).                              |
| `cpDialogDisplay`           | Dialog mode: `'popup'` (default), `'inline'`.                                |
| `cpIgnoredElements`         | HTML elements ignored when clicked (`[]`).                                   |
| `cpSaveClickOutside`        | Save selected color on outside click (`true`).                               |
| `cpCloseClickOutside`       | Close dialog on outside click (`true`).                                      |
| `cpOKButton`                | Show OK/Apply button (`false`).                                              |
| `cpOKButtonText`            | Text for OK button (`'OK'`).                                                 |
| `cpOKButtonClass`           | Class for customizing OK button (`''`).                                      |
| `cpCancelButton`            | Show Cancel/Reset button (`false`).                                          |
| `cpCancelButtonText`        | Text for Cancel button (`'Cancel'`).                                         |
| `cpCancelButtonClass`       | Class for customizing Cancel button (`''`).                                  |
| `cpAddColorButton`          | Show Add Color button (`false`).                                             |
| `cpAddColorButtonText`      | Text for Add Color button (`'Add color'`).                                   |
| `cpAddColorButtonClass`     | Class for customizing Add Color button (`''`).                               |
| `cpRemoveColorButtonClass`  | Class for customizing Remove Color button (`''`).                            |
| `cpPresetColorsClass`       | Custom class for preset colors section.                                      |
| `cpMaxPresetColorsLength`   | Max number of preset colors.                                                 |
| `cpPresetEmptyMessage`      | Message to show when presets are empty.                                      |
| `cpPresetEmptyMessageClass` | Class for styling the empty message.                                         |
| `colorPickerOpen`           | Emits current color when dialog opens.                                       |
| `colorPickerClose`          | Emits current color when dialog closes.                                      |
| `colorPickerChange`         | Emits changed color when user picks a new color.                             |
| `colorPickerCancel`         | Emits when Cancel button is pressed.                                         |
| `colorPickerSelect`         | Emits selected color when OK is pressed.                                     |
| `cpToggleChange`            | Emits dialog open/close state (`boolean`).                                   |
| `cpInputChange`             | Emits input change `{input, value, color}`.                                  |
| `cpSliderChange`            | Emits slider change `{slider, value, color}`.                                |
| `cpSliderDragStart`         | Emits on slider drag start `{slider, color}`.                                |
| `cpSliderDragEnd`           | Emits on slider drag end `{slider, color}`.                                  |
| `cpCmykColorChange`         | Emits CMYK string if enabled (`string`).                                     |
| `cpPresetColorsChange`      | Emits when Add Color is pressed (`array`).                                   |

---

##### Available control / helper functions (provided by the directive):

```javascript
openDialog(); // Opens the color picker dialog if not already open.
closeDialog(); // Closes the color picker dialog if not already closed.
```
