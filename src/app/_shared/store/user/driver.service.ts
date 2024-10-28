import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { BaseApiService } from '../base-api.service';

@Injectable({ providedIn: 'root' })
export class DriverService extends BaseApiService {
  baseUrl = `${this.apiURL}/driver`;

  index(page: number, per_page: number, search: string, withActive: boolean) {
    let params = new HttpParams();
    params = params.set('page', page);
    params = params.set('per_page', per_page);
    params = search ? params.set('search', search) : params;
    params = params.set('active', withActive ? 1 : 0);
    return this.get(`${this.baseUrl}`, { params });
  }

  show(id: number) {
    return this.get(`${this.baseUrl}/${id}`);
  }
}
