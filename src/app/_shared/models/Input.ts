import {ThemePalette} from '@angular/material/core';

export interface Input {
  id?: number;
  name: string;
  selected: boolean;
  color: ThemePalette;
  customers?: Input[];
}
