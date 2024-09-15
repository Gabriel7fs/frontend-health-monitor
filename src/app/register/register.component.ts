import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent  {

  registerForm!: FormGroup;
  showPassword = false;
  selectedSegment: string = 'paciente';
  isToastOpen = false;

  constructor(private formBuilder: FormBuilder) {
    this.createRegisterForm();
  }

  createRegisterForm() {
    this.registerForm = this.formBuilder.group({
      name: [
        '',
        Validators.compose([
          Validators.required,
        ])
      ],
      cpf: [
        '',
        Validators.compose([
          Validators.required,
          Validators.maxLength(14)
        ])
      ],
      birthdate: [
        '',
        Validators.compose([
          Validators.required,
        ])
      ],
      emergencyContact: [
        '',
        Validators.compose([
          Validators.required,
        ])
      ],
      password: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(30)
        ])
      ],
    })
  }

  onSegmentChange(event: any) {
    this.selectedSegment = event.detail.value;
    this.registerForm.reset();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  setOpen(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }

  applyCPFMask(event: any) {
    let input = event.target.value.replace(/\D/g, '');

    if (input.length > 11) {
        input = input.substring(0, 11);
    }

    input = this.formatCPF(input);
    event.target.value = input;
  }

  formatCPF(input: string): string {
    if (input.length > 9) {
        return input.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (input.length > 6) {
        return input.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (input.length > 3) {
        return input.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }
    return input;
  }


  applyBirthdateMask(event: any) {
    let input = event.target.value.replace(/\D/g, '');

    if (input.length > 8) {
      input = input.substring(0, 8);
    }

    if (input.length > 2 && input.length <= 4) {
      input = input.replace(/(\d{2})(\d{1,2})/, '$1/$2');
    } else if (input.length > 4) {
      input = input.replace(/(\d{2})(\d{2})(\d{1,4})/, '$1/$2/$3');
    }

    this.registerForm.get('birthdate')?.setValue(input, { emitEvent: false });
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

    this.registerForm.get('emergencyContact')?.setValue(input, { emitEvent: false });
  }

  onRegister() {
    if (this.registerForm.valid) {
      let { cpf, password, birthdate, emergencyContact } = this.registerForm.value;

      cpf = cpf.replace(/\./g, '').replace(/-/g, '');
      birthdate = birthdate.replace(/\//g, '');
      emergencyContact = emergencyContact.replace(/\D/g, '');

      console.log('Registrando com', cpf, birthdate, emergencyContact, password);
      // lógica para registro
    } else {
      this.isToastOpen = true;
    }
  }

}
