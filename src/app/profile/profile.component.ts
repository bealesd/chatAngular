import { Component, OnInit } from '@angular/core';
import { Form } from '@angular/forms';
import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  public url: any;
  constructor(public profileService: ProfileService) { }

  ngOnInit(): void {
  }

  uploadImage(file: File){ 
    this.profileService.updateProfile(file);
  }

  async getProfile(){
    await this.profileService.getProfile();
    (document.querySelector("#t4") as any).src = window['profileImageUrl'];

  }
}
