import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  formData: any = {
    username: '',
    password: '',
  };
  error = '';

  constructor(private router: Router, private http: HttpClient) {
  }

  ngOnInit() {
  }

  login() {
    const self = this;
    this.http.post(`http://localhost:3000/auth/`, this.formData)
      .toPromise()
      .then((data: any) => {
        if (data.message) {
          self.error = data.message;
        } else {
          localStorage.setItem('userinfo', JSON.stringify(data[0]));
          self.router.navigate(['room']);
        }
      })
      .catch(err => {
        console.log(err);
      });
  }
}
