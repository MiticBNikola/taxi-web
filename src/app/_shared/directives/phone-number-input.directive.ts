import { Directive, HostListener, ElementRef } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appPhoneNumberControlInput]',
  standalone: true,
})
export class PhoneNumberControlInputDirective {
  private regex = new RegExp(/^\+\d*$/g);
  // Allow key codes for special events. Reflect :
  // Backspace, tab, end, home
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete'];
  constructor(
    private el: ElementRef,
    private control: NgControl
  ) {}
  @HostListener('keypress', ['$event']) onKeyDown(event: KeyboardEvent) {
    // Allow Backspace, tab, end, and home keys
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    const current: string = this.el.nativeElement.value;
    const position = this.el.nativeElement.selectionStart;
    const next: string = [current.slice(0, position), event.key, current.slice(position)].join('');
    if (next && !String(next).match(this.regex)) {
      event.preventDefault();
    }
  }
  @HostListener('paste', ['$event']) onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const inputText: string = event.clipboardData?.getData('text') ?? '';
    const filteredText = inputText.replace(/[^0-9]/g, '');
    this.control.control?.setValue('+' + filteredText);
  }
}
