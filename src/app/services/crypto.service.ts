import { Injectable } from '@angular/core';

import SHA3 from 'crypto-js/sha3';
import Utf8 from 'crypto-js/enc-utf8';
import AES from 'crypto-js/aes';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  users = {
    'ad5af8c4ccdda26a311f63d66c076fb0018f7ee5b1b6b3c5c7f8f8a7b82d9c95f049816499e699643d343dbe4426c74981123711be3be32aa7e0a4e9782d17f2':
    'U2FsdGVkX18uUU9UfscpDM22DwXM/zTVqRXLpnQZzxyafiQtARw0XXrGFnnBsAYvLjpoJN058FumagXRfQ567Rnjwlno8xlnV3grP/KiZGlfiX1kVRqHELNMl446Pl5/mnv8dZXXKk9cNI3wFrQvcg==',
    'b6a2ee52e2c5fadec64977e24a64a30a4f373a1bcc98ed16a9ad5d9057d3bb618fda7d5a1d2c3d4817f6da70dd0359a5e6471776af3759b360b28b13f741cb98':
    'U2FsdGVkX19eBfoMsS6OqvOpApbejvC86jZEvRkEsQfVGdIQ1CmktxSjFnGduEPpQg3ZLtpyCVopW0dAo35JCLp4YyixXRcKdLVumMDfx6OsNqbOfvTUdeGZ0tdyv2G2a55Ppz6UPGUnq0irUvq2qw=='
  };

  loginTime: string = '';
  encrytedCitherKey: string = '';
  encrytedUsername: string = '';

  constructor(private messageService: MessageService) {}

  hash(value){
    return SHA3(btoa(value)).toString();
  }

  get username(){
    return this.getLoginKey().username.toLowerCase();
  }

  createNewUser(username: string, password: string) {
    this.messageService.add(`Creating new user.`, 'info');

    const currentUsername = this.getLoginKey().username;
    if(currentUsername !== 'admin'){
      this.messageService.add(` • You do not have admin permissions to create a user.`, 'error');
      return;
    }

    const pwHash = this.hash(password);
    const userHash = this.hash(username);

    const partiallyEncryptedToken = AES.encrypt(this.getToken(), pwHash).toString();
    const encryptedToken =  AES.encrypt(partiallyEncryptedToken, userHash).toString();

    alert(`Add to users: '${userHash}':'${encryptedToken}'`);
    this.messageService.add(`Add to users: '${userHash}':'${encryptedToken}'`, 'warning');
  }

  encryptCredentials(username: string, password: string) {
    this.loginTime = new Date().toString();
    this.encrytedUsername = AES.encrypt(btoa(username), this.loginTime).toString();
    this.encrytedCitherKey = AES.encrypt(btoa(password), this.loginTime).toString();;
  }

  logout() {
    this.loginTime = '';
    this.encrytedCitherKey = '';
  }

  getLoginKey() {
    const username = atob(AES.decrypt(this.encrytedUsername, this.loginTime).toString(Utf8));
    const password = atob(AES.decrypt(this.encrytedCitherKey, this.loginTime).toString(Utf8));
    return { password: password, username: username };
  }

  getToken() {
    const keys = this.getLoginKey();  

    const pwHash = this.hash(keys.password)
    const userHash = this.hash(keys.username);

    const partialDecryption = AES.decrypt(this.users[userHash], userHash).toString(Utf8);
    return AES.decrypt(partialDecryption, pwHash).toString(Utf8);
  }
}
