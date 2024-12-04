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
      this.username = userData.name || '';
      this.emergencyContact = this.formatPhone(userData.emergencyContact || '');
      this.cpf = this.formatCpf(userData.cpf || '');
      this.birthDate = this.formatDate(userData.birthDate || '');
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
    const input = this.formatPhone(event.target.value);
    this.profileForm.get('emergencyContact')?.setValue(input, { emitEvent: false });
  }

  formatPhone(phone: any): string {
    const phoneString = String(phone);

    let cleaned = phoneString.replace(/\D/g, '');

    if (cleaned.length > 11) {
      cleaned = cleaned.substring(0, 11);
    }

    if (cleaned.length <= 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
      return cleaned.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
  }

  formatDate(date: string): string {
    if (!date) return '';
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  formatCpf(cpf: any): string {
    const cpfString = String(cpf);
    let cleaned = cpfString.replace(/\D/g, '');

    if (cleaned.length > 11) {
      cleaned = cleaned.substring(0, 11);
    }

    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  updateLocalStorage(address: string, emergencyContact: string) {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    userData.address = address;
    userData.emergencyContact = emergencyContact;
    localStorage.setItem('user', JSON.stringify(userData));
  }

  prepareUserData(address: string, emergencyContact: string | null) {
    let userData: any = { address };

    if (this.type === 'PACIENT') {
      userData.emergencyContact = this.cleanEmergencyContact(emergencyContact);
    }

    return userData;
  }

  cleanEmergencyContact(contact: string | null): number | null {
    if (contact) {
      const cleanedContact = contact.replace(/\D/g, '');
      return parseInt(cleanedContact, 10);
    }
    return null;
  }

  onUpdateProfile() {
    const updatedAddress = this.profileForm.get('address')?.value;
    const updatedEmergencyContact = this.profileForm.get('emergencyContact')?.value;

    this.updateLocalStorage(updatedAddress, updatedEmergencyContact);

    const userData = this.prepareUserData(updatedAddress, updatedEmergencyContact);

    this.userService.updateUser(this.userId, userData)
    .subscribe({
      next: () => this.isToastOpen = true,
      error: () => this.showErrorToast('Erro ao atualizar as informações')
    });
  }
}
