import { Injectable } from '@angular/core';

import { BaseApiService } from '../base-api.service';

@Injectable({ providedIn: 'root' })
export class CustomerService extends BaseApiService {
  baseUrl = `${this.apiURL}/customer`;

  show(id: number) {
    return this.get(`${this.baseUrl}/${id}`);
  }

  destroy(id: number) {
    return this.delete(`${this.baseUrl}/${id}`);
  }
}
