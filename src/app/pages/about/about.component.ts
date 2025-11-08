import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, Input } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NavbarStateService } from '../../services/navbar-state.service';
import { RouterLink } from '@angular/router';
import { FooterComponent } from "../../main-app/footer/footer.component";
import { ThemeService } from '../../services/theme.service';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-about',
    standalone: true,
    imports: [RouterLink, FooterComponent, NgClass],
    templateUrl: './about.component.html',
    styleUrl: './about.component.scss'
})
export class AboutComponent {
    http = inject(HttpClient);
    authService = inject(AuthService);
    themeService = inject(ThemeService);

    isNavbarExpanded: boolean = false;

    // Input to receive theme status
    @Input() isDarkMode: boolean = false;

    constructor(private navbarStateService: NavbarStateService) {
      this.navbarStateService.navbarExpanded$.subscribe((expanded) => {
        this.isNavbarExpanded = expanded;
      });
    }


   
}