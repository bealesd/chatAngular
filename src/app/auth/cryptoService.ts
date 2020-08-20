import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  esther = 'U2FsdGVkX1+2bosGgs1TSgRwcXaR/YfcrbVtj1PE7vsTepC8G+G9ZHGLwEHzSg4tnCypPluriQaJWHq3icR9cQ==';
  loginTime = 'lt';
  encrytedCitherKey = 'eck';

  constructor() { }

  createKey(password: string, token: string) {
    const hash = CryptoJS.SHA3(window.btoa(password)).toString();
    return CryptoJS.AES.encrypt(token, hash).toString();
  }

  login(citherKey: string, loginTime: string) {
    sessionStorage.setItem(this.loginTime, loginTime);
    const encrytedCitherKey = CryptoJS.AES.encrypt(window.btoa(citherKey), loginTime).toString();
    sessionStorage.setItem(this.encrytedCitherKey, encrytedCitherKey);
  }

  logout() {
    sessionStorage.removeItem(this.loginTime);
    sessionStorage.removeItem(this.encrytedCitherKey);
  }

  getLoginKey(): string {
    let loginTime = sessionStorage.getItem(this.loginTime);
    if (loginTime === undefined || loginTime === null)
      loginTime = '';

    let encrytedCitherKey = sessionStorage.getItem(this.encrytedCitherKey);
    if (encrytedCitherKey === undefined || encrytedCitherKey === null)
      encrytedCitherKey = '';

    const b64Key = CryptoJS.AES.decrypt(encrytedCitherKey, loginTime).toString(CryptoJS.enc.Utf8);
    return window.atob(b64Key);
  }

  getToken() {
    const pw = this.getLoginKey();
    const hash = CryptoJS.SHA3(window.btoa(pw)).toString()
    return CryptoJS.AES.decrypt(this.esther, hash).toString(CryptoJS.enc.Utf8);
  }
}
