import { PhoneNumber } from './PhoneNumber';

export interface Manager {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  number_of_rides: number;
  numbers: PhoneNumber[];
}
