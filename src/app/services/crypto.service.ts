import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  esther = 'U2FsdGVkX1+2bosGgs1TSgRwcXaR/YfcrbVtj1PE7vsTepC8G+G9ZHGLwEHzSg4tnCypPluriQaJWHq3icR9cQ==';
  encrytedCitherKeyPropertyName = 'eck';

  loginTime: string = '';
  encrytedCitherKey: string = '';

  constructor() { }

  createKey(password: string, token: string) {
    const hash = CryptoJS.SHA3(window.btoa(password)).toString();
    return CryptoJS.AES.encrypt(token, hash).toString();
  }

  encryptCredentials(citherKey: string) {
    this.loginTime = new Date().toString();
    this.encrytedCitherKey = CryptoJS.AES.encrypt(window.btoa(citherKey), this.loginTime).toString();
  }

  logout() {
    this.loginTime = '';
    this.encrytedCitherKey = '';
  }

  getLoginKey(): string {
    const b64Key = CryptoJS.AES.decrypt(this.encrytedCitherKey, this.loginTime).toString(CryptoJS.enc.Utf8);
    return window.atob(b64Key);
  }

  getToken() {
    const pw = this.getLoginKey();
    const hash = CryptoJS.SHA3(window.btoa(pw)).toString()
    return CryptoJS.AES.decrypt(this.esther, hash).toString(CryptoJS.enc.Utf8);
  }

  encryptMessage(plainText: string) {
    const pw = this.getLoginKey();
    const hash = CryptoJS.SHA3(window.btoa(pw)).toString()
    return CryptoJS.AES.encrypt(plainText, hash).toString(CryptoJS.enc.Utf8);
  }

  decryptMessage(citherText: string) {
    const pw = this.getLoginKey();
    const hash = CryptoJS.SHA3(window.btoa(pw)).toString()
    return CryptoJS.AES.decrypt(citherText, hash).toString(CryptoJS.enc.Utf8);
  }
}
