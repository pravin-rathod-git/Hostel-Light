import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-varify-email',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './varify-email.component.html',
  styleUrls: ['./varify-email.component.scss']
})
export class VarifyEmailComponent {
  // This component is purely presentational. No logic is needed.
  // The global auth state is handled by AppComponent.
}