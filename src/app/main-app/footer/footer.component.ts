import { Component } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  email: string = ''; // Variable to store the email input

  subscribe() {
    if (this.email) {
      // Send the email using SMTP.js
      (window as any).Email.send({
        SecureToken : "e68f66ee-3203-442e-a0eb-16b08f85550e",
		    To: 'adityagurav54@gmail.com',
		    From: "adityagurav54@gmail.com",
        Subject: 'New Subscription',
        Body: `A new user has subscribed with the following email: ${this.email}`,
      })
        .then(() => {
          alert('Thank you for subscribing! Your email has been sent.');
          this.email = ''; // Clear the input field after submission
        })
        .catch((error: any) => {
          alert('Failed to send subscription email: ' + error.message);
        });
    } else {
      alert('Please enter a valid email address.');
    }
  }
}
