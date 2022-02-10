import { Component, OnInit } from '@angular/core';
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
    window['pageTitle'] = 'Profile Information';
    window['toolInfo'] = ''
  }

  async uploadImage(file: File){ 
    const result = await this.profileService.updateProfile(file);
    if (result)
      alert(`Added new profile image.`);
    else 
      alert(`Failed to add new profile image.`);
  }

  async getProfile(){
    await this.profileService.getProfile();
    (document.querySelector("#t4") as any).src = window['profileImageUrl'];

  }
}
