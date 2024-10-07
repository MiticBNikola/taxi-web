import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { BaseApiService } from './base-api.service';

@Injectable({ providedIn: 'root' })
export class RideService extends BaseApiService {
  baseUrl = `${this.apiURL}/ride`;

  index(page: number, per_page: number, userParams?: { key: string; value: number }) {
    let params = new HttpParams();
    params = page ? params.set('page', page) : params;
    params = per_page ? params.set('per_page', per_page) : params;
    params = userParams ? params.set(userParams.key, userParams.value) : params;
    return this.get(`${this.baseUrl}`, { params });
  }
}
