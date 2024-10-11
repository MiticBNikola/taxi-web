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

  makeRequest(start_location: string, end_location: string, customer_id?: number) {
    return this.post(`${this.baseUrl}`, {
      start_location,
      end_location,
      ...(customer_id && { customer_id }),
      request_time: new Date().toISOString(),
    });
  }

  cancel(id: number) {
    return this.delete(`${this.baseUrl}/${id}/cancel`);
  }

  acceptRide(id: number, driver_id: number) {
    return this.put(`${this.baseUrl}/${id}/accept`, { driver_id });
  }

  updateEnd(id: number, end_location: string) {
    return this.put(`${this.baseUrl}/${id}/update-end`, { end_location });
  }

  startRide(id: number) {
    return this.put(`${this.baseUrl}/${id}/start`, { start_time: new Date().toISOString() });
  }

  endRide(id: number) {
    return this.put(`${this.baseUrl}/${id}/end`, { end_time: new Date().toISOString() });
  }
}
