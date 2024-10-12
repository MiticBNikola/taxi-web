import { Injectable, TemplateRef } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts: any[] = [];

  show(textOrTpl: string | TemplateRef<any>, options: any = {}) {
    options = { ...options, classname: 'bg-info text-light mt-2' };
    this.toasts.push({ textOrTpl, ...options });
  }

  success(textOrTpl: string | TemplateRef<any>, options: any = {}) {
    options = { ...options, classname: 'bg-success text-light mt-2' };
    this.toasts.push({ textOrTpl, ...options });
  }

  error(textOrTpl: string | TemplateRef<any>, options: any = {}) {
    options = { ...options, classname: 'bg-danger text-light mt-2' };
    this.toasts.push({ textOrTpl, ...options });
  }

  remove(toast: any) {
    this.toasts = this.toasts.filter((t) => t !== toast);
  }

  clear() {
    this.toasts.splice(0, this.toasts.length);
  }
}
