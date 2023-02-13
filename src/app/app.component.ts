import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import Validation from './utils/validation';
import { Md5 } from 'ts-md5';
import * as CryptoJS from 'crypto-js';
import { environment } from '../environments/environment';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  form: FormGroup;
  submitted = false;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    let values = localStorage.getItem('values');
    let _key = CryptoJS.enc.Utf8.parse(environment.key);
    let _iv = CryptoJS.enc.Utf8.parse(environment.key);
    let decrypted = null;
    let formValues = null;
    if (values) {
      decrypted = CryptoJS.AES.decrypt(values, _key, {
        keySize: 16,
        iv: _iv,
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      }).toString(CryptoJS.enc.Utf8);
    }
    if (decrypted) {
      formValues = JSON.parse(JSON.parse(decrypted));
    }
    this.form = this.formBuilder.group({
      url: ['', Validators.required],
      username: [formValues ? formValues.username : '', [Validators.required]],
      password: [formValues ? formValues.password : '', [Validators.required]],
    });
  }
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    console.log(JSON.stringify(this.form.value, null, 2));
    console.log(
      `${this.form.value.url}/login?hash=${Md5.hashStr(
        `${this.form.value.username}:${this.form.value.password}`
      )}`
    );
    window.open(
      `${this.form.value.url}/login?hash=${Md5.hashStr(
        `${this.form.value.username}:${this.form.value.password}`
      )}`,
      '_blank'
    );
    let _key = CryptoJS.enc.Utf8.parse(environment.key);
    let _iv = CryptoJS.enc.Utf8.parse(environment.key);

    let encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(JSON.stringify(this.form.value)),
      _key,
      {
        keySize: 16,
        iv: _iv,
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      }
    );
    localStorage.setItem('values', encrypted.toString());
  }
}
