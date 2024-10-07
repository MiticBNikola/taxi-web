import { PhoneNumber } from './PhoneNumber';

export interface Driver {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  number_of_rides: number;
  driving_license_category: string;
  driving_license_number: number;
  has_vehicle: boolean;
  is_active: boolean;
  numbers: PhoneNumber[];
}
