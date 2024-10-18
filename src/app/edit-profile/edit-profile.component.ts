import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {

  profileForm!: FormGroup;
  isToastOpen = false;
  isErrorToastOpen = false;
  errorMessage = '';

  userId: any;
  username: any;
  emergencyContact: any;
  cpf: any;
  birthDate: any;
  address: any;
  type: any;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
  ) {
    this.profileForm = this.formBuilder.group({
      userName: [''],
      emergencyContact: [''],
      cpf: [''],
      birthDate: [''],
      address: ['']
    });

  }

  ngOnInit() {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData) {
      this.userId = userData.id;
      this.username = userData.username || '';
      this.emergencyContact = userData.emergencyContact || '';
      this.cpf = userData.cpf || '';
      this.birthDate = userData.birthDate || '';
      this.address = userData.address || '';
      this.type = userData.type;

      this.profileForm.patchValue({
        userName: this.username,
        emergencyContact: this.emergencyContact,
        cpf: this.cpf,
        birthDate: this.birthDate,
        address: this.address
      });
    }
  }

  onToastDismiss() {
    this.isToastOpen = false;
  }

  onErrorToastDismiss() {
    this.isErrorToastOpen = false;
  }

  showErrorToast(message: any) {
    this.errorMessage = message;
    this.isErrorToastOpen = true;
  }

  applyPhoneMask(event: any) {
    let input = event.target.value.replace(/\D/g, '');

    if (input.length > 11) {
      input = input.substring(0, 11);
    }

    if (input.length <= 10) {
      input = input.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
      input = input.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }

    this.profileForm.get('emergencyContact')?.setValue(input, { emitEvent: false });
  }

  onUpdateProfile() {

    let userData = {};

    if (this.type === 'PACIENT') {
      let emergencyContactValue = this.profileForm.get('emergencyContact')?.value;

      if (emergencyContactValue) {
        emergencyContactValue = emergencyContactValue.replace(/\D/g, '');

        emergencyContactValue = parseInt(emergencyContactValue, 10);
      }

      console.log(emergencyContactValue);

      userData = {
        emergencyContact: emergencyContactValue,
        address: this.profileForm.get('address')?.value
      };
    } else if (this.type === 'MONITOR') {
      userData = {
        address: this.profileForm.get('address')?.value
      };
    }

    this.userService.updateUser(this.userId, userData)
    .subscribe({
      next: (response) => {
        this.isToastOpen = true;
      },
      error: (err) => {
        this.showErrorToast('Erro ao atualizar as informações');
      }
    });
  }
}
