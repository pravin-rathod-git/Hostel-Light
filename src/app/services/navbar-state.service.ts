import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NavbarStateService {
  private navbarExpanded = new BehaviorSubject<boolean>(false);
  navbarExpanded$ = this.navbarExpanded.asObservable();

  toggleNavbar() {
    this.navbarExpanded.next(!this.navbarExpanded.value);
  }
}
