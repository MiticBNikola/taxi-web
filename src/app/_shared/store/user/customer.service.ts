import { Injectable } from '@angular/core';

import { BaseApiService } from '../base-api.service';

@Injectable({ providedIn: 'root' })
export class CustomerService extends BaseApiService {
  baseUrl = `${this.apiURL}/customer`;

  show(id: number) {
    return this.get(`${this.baseUrl}/${id}`);
  }

  update(id: number, formData: FormData) {
    return this.put(`${this.baseUrl}/${id}`, formData);
  }

  destroy(id: number) {
    return this.delete(`${this.baseUrl}/${id}`);
  }
}
