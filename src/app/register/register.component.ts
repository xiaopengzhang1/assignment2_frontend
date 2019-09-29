import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Router} from '@angular/router';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  formData: any = {
    username: '',
    password: '',
    avatar: 'https://c.staticblitz.com/assets/client/components/SideMenu/blitz_logo-11cebad97cad4b50bc955cf72f532d1b.png',
  };
  imgsrc = 'https://c.staticblitz.com/assets/client/components/SideMenu/blitz_logo-11cebad97cad4b50bc955cf72f532d1b.png';
  error: '';

  constructor(private router: Router, private http: HttpClient, public d: DomSanitizer) {
  }

  ngOnInit() {
  }

  register() {
    const self = this;
    this.http.post(`http://localhost:3000/user/`, this.formData)
      .toPromise()
      .then((data: any) => {
        if (data.message) {
          self.error = data.message;
        } else {
          self.router.navigate(['login']);
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  fileChange(e) {
    const reader = new FileReader();
    const file = e.srcElement.files[0];
    reader.readAsDataURL(file);
    const self = this;
    // tslint:disable-next-line:only-arrow-functions no-shadowed-variable
    reader.onload = function(e: any) {
      self.formData.avatar = e.target.result;
    };
    this.imgsrc = window.URL.createObjectURL(file); // 获取上传的图片临时路径
  }
}
