import {Component, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent implements OnInit {

  constructor(public modalRef: NgbActiveModal) {
  }

  ngOnInit(): void {
  }

  onNoClick() {

    this.modalRef.close();
  }

  onDeleteClick() {
    this.modalRef.close(true);
  }
}
