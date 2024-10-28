import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { BaseApiService } from './base-api.service';

@Injectable({ providedIn: 'root' })
export class RideService extends BaseApiService {
  baseUrl = `${this.apiURL}/ride`;

  index(
    page: number,
    per_page: number,
    search: string,
    withRequested: boolean,
    withInProgress: boolean,
    userParams?: { key: string; value: number }
  ) {
    let params = new HttpParams();
    params = params.set('page', page);
    params = params.set('per_page', per_page);
    params = !userParams && search ? params.set('search', search) : params;
    params = !userParams ? params.set('requested', withRequested ? 1 : 0) : params;
    params = !userParams ? params.set('in_progress', withInProgress ? 1 : 0) : params;
    params = userParams ? params.set(userParams.key, userParams.value) : params;
    return this.get(`${this.baseUrl}`, { params });
  }

  bestDrivers() {
    return this.get(`${this.baseUrl}/best-month-drivers`);
  }

  rideStatus(rideId: string | null, type: string, userId?: number) {
    let params = new HttpParams();
    params = rideId ? params.set('ride_id', +rideId) : params;
    params = userId ? params.set(`${type}_id`, userId) : params;
    return this.get(`${this.baseUrl}/status`, { params });
  }

  requestedRides() {
    return this.get(`${this.baseUrl}/requested`);
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

  updateEnd(id: number, end_location: string, end_lat: number, end_lng: number) {
    return this.put(`${this.baseUrl}/${id}/update-end`, { end_location, end_lat, end_lng });
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
