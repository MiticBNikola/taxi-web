import {Component, OnInit} from '@angular/core';
import {Input} from '../../_shared/models/Input';
import {FormGroup} from '@angular/forms';
import {User} from '../../_shared/models/User';

@Component({
  selector: 'app-dashboard-dispatcher-view',
  templateUrl: './dashboard-dispatcher-view.component.html',
  styleUrls: ['./dashboard-dispatcher-view.component.css']
})
export class DashboardDispatcherViewComponent implements OnInit {
  public center: google.maps.LatLngLiteral = {
    lat: 43.320994,
    lng: 21.895730,
  };
  public map: google.maps.Map;

  public form: FormGroup;
  public customers: User[] = [{id: 1, name: 'Mika', email: ''}, {id: 2, name: 'Pera', email: ''}];
  public customersInTaxi = [];
  public drivers: User[] = [];
  public activeDrivers: User[] = [];
  public nonActiveDrivers: User[] = [];
  public allSelected = false;
  public input: Input = {
    name: 'Svi',
    selected: false,
    color: 'warn',
    customers: []
  };

  constructor() {
  }

  ngOnInit(): void {
    this.initMap();
    this.populateInputCustomers();
  }

  initMap(): void {
    this.map = new google.maps.Map(
      document.getElementById('map') as HTMLElement,
      {
        mapTypeId: 'roadmap',
        zoomControl: true,
        scrollwheel: true,
        gestureHandling: 'cooperative',
        zoom: 14,
        maxZoom: 30,
        minZoom: 12,
        backgroundColor: 'bg-secondary',
        center: this.center,
        clickableIcons: false
      }
    );
  }

  locateCustomer() {

  }

  locateDrivers() {

  }

  populateInputCustomers() {
    this.customers.map(customer => {
      this.input.customers.push({
        id: customer.id,
        name: customer.name,
        selected: false,
        color: 'warn'
      });
    });
    let tmpSelectAll = true;
    this.input.customers.map(single => {
      tmpSelectAll = tmpSelectAll && single.selected;
    });
    tmpSelectAll ? (this.customers.length === 0 ? this.allSelected = false : this.allSelected = true) : this.allSelected = false;
  }

  someSelected(): boolean {
    if (this.input.customers == null) {
      return false;
    }
    return this.input.customers.filter(customer => customer.selected).length > 0 && !this.allSelected;
  }

  setAll(selected: boolean) {
    this.allSelected = selected;
    if (this.input.customers == null) {
      return;
    }
    this.input.customers.forEach(customer => customer.selected = selected);
  }

  updateAllComplete() {
    this.allSelected = this.input.customers != null && this.input.customers.every(worker => worker.selected);
  }

  acceptCustomerRequests() {
    const newCustomers = this.input.customers
      .filter(customer => {
        if (customer.selected === true) {
          return customer;
        }
      });
    if (newCustomers.length > 0) {
      this.customersInTaxi.push(newCustomers);
    }
  }
}



