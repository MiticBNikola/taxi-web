import { Component, inject, Input } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [FaIconComponent],
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.scss',
})
export class ConfirmationComponent {
  faWarningIcon = faTriangleExclamation;

  activeModal = inject(NgbActiveModal);
  @Input() title = '';
  @Input() sentence = '';
  @Input() confirmation = '';

  hideModal() {
    this.activeModal.dismiss();
  }

  confirmModal() {
    this.activeModal.close(true);
  }
}
