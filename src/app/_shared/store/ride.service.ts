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

  rideStatus(rideId: string | null, userId?: number) {
    let params = new HttpParams();
    params = rideId ? params.set('ride_id', +rideId) : params;
    params = userId ? params.set('user_id', userId) : params;
    return this.get(`${this.baseUrl}/status`, { params });
  }

  makeRequest(
    start_location: string,
    start_point: { lat: number; lng: number },
    end_location: string,
    end_point: { lat: number; lng: number },
    customer_id?: number
  ) {
    return this.post(`${this.baseUrl}`, {
      start_location,
      start_lat: start_point.lat,
      start_lng: start_point.lng,
      end_location,
      end_lat: end_point.lat,
      end_lng: end_point.lng,
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

  sendMyLocation(myLocation: { lat: number; lng: number }, driverId: number, rideId: number) {
    return this.post(`${this.baseUrl}/${rideId}/driver/${driverId}/position`, { ...myLocation });
  }
}
