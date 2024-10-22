import { Customer } from './Customer';
import { Driver } from './Driver';

export interface Ride {
  id: number;
  request_time: Date;
  start_location: string;
  start_lat: number;
  start_lng: number;
  end_location: string | null;
  end_lat: number | null;
  end_lng: number | null;
  start_time: Date | null;
  end_time: Date | null;
  customer_id: number | null;
  driver_id: number | null;
  customer: Customer | null;
  driver: Driver | null;
}
