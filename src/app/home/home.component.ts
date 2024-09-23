import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faGift, faMap, faRotate } from '@fortawesome/free-solid-svg-icons';
import { faRoad } from '@fortawesome/free-solid-svg-icons/faRoad';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FaIconComponent, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  protected readonly faRoad = faRoad;
  protected readonly faMap = faMap;
  protected readonly faRotate = faRotate;
  protected readonly faGift = faGift;
}
