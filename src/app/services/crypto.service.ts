import { Injectable } from '@angular/core';

import SHA3 from 'crypto-js/sha3';
import Utf8 from 'crypto-js/enc-utf8';
import AES from 'crypto-js/aes';

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
    const hash = SHA3(window.btoa(password)).toString();
    return AES.encrypt(token, hash).toString();
  }

  encryptCredentials(citherKey: string) {
    this.loginTime = new Date().toString();
    this.encrytedCitherKey = AES.encrypt(window.btoa(citherKey), this.loginTime).toString();
  }

  logout() {
    this.loginTime = '';
    this.encrytedCitherKey = '';
  }

  getLoginKey(): string {
    const b64Key = AES.decrypt(this.encrytedCitherKey, this.loginTime).toString(Utf8);
    return window.atob(b64Key);
  }

  getToken() {
    const pw = this.getLoginKey();
    const hash = SHA3(window.btoa(pw)).toString()
    return AES.decrypt(this.esther, hash).toString(Utf8);
  }

  encryptMessage(plainText: string) {
    const pw = this.getLoginKey();
    const hash = SHA3(window.btoa(pw)).toString()
    return AES.encrypt(plainText, hash).toString(Utf8);
  }

  decryptMessage(citherText: string) {
    const pw = this.getLoginKey();
    const hash = SHA3(window.btoa(pw)).toString()
    return AES.decrypt(citherText, hash).toString(Utf8);
  }
}
