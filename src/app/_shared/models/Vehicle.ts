import { Steer } from './Steer';

export interface Vehicle {
  id: number;
  license_plate: string;
  registration_date: string;
  brand: string;
  model: string;
  model_year: number;
  color?: string;
  has_driver: boolean;
  steer: Steer;
}
