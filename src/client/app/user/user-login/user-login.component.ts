import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AlertService } from '#Alert/alert.service';
import { NavBarService } from '#Shared/nav-bar.service';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.scss']
})
export class UserLoginComponent implements OnInit {
  username: string;
  password: string;
  loading = false;

  constructor(
    private router: Router,
    private userService: UserService,
    private alertService: AlertService,
    private navBarService: NavBarService
  ) {}

  /**
   * Initialize the login service. Ensure that there is not already a user logged in by logging out.
   */
  ngOnInit() {
    this.userService.logout();
    this.navBarService.navigate({ page: 'login' });
  }

  /**
   * Standard login function. Nothing much else to say.
   */
  login(): void {
    this.alertService.clear();
    this.loading = true;
    this.userService.login(this.username, this.password).subscribe(
      () => {
        this.router.navigate(['/']);
      },
      (error) => {
        this.loading = false;
        this.alertService.error(error.error);
      }
    );
  }
}
