import { Customer } from './Customer';
import { Driver } from './Driver';

export interface Ride {
  id: number;
  request_time: Date;
  start_location: string;
  end_location: string | null;
  start_time: Date | null;
  end_time: Date | null;
  customer_id: number | null;
  driver_id: number | null;
  customer: Customer | null;
  driver: Driver | null;
}
