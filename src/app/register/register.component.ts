import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterService } from '../services/register.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {

  registerForm!: FormGroup;
  showPassword = false;
  isToastOpen = false;
  errorMessage = '';
  selectedSegment = 'paciente';

  private readonly INVALID_CPF_ERROR = "CPF inválido!";
  private readonly INVALID_ASSOCIATED_CPF_ERROR = "CPF do paciente inválido!";
  private readonly REGISTRATION_ERROR = "Erro ao registrar o usuário. Tente novamente.";
  private readonly FORM_ERROR = "Preencha todos os campos obrigatórios.";

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private registerService: RegisterService,
  ) { }

  ngOnInit() {
    this.createRegisterForm();
  }

  createRegisterForm() {
    this.registerForm = this.formBuilder.group({
      username: ['', Validators.required],
      cpf: ['', [Validators.required]],
      birthdate: [''],
      emergencyContact: [''],
      cpfAssociateds: [''],
      password: ['', Validators.required],
      type: [this.selectedSegment]
    });
  }

  adjustValidators() {
    if (this.selectedSegment === 'paciente') {
      this.registerForm.get('birthdate')?.setValidators([Validators.required]);
      this.registerForm.get('emergencyContact')?.setValidators([Validators.required]);
      this.registerForm.get('cpfAssociateds')?.clearValidators();
      this.registerForm.get('cpfAssociateds')?.reset();
    } else if (this.selectedSegment === 'monitor') {
      this.registerForm.get('birthdate')?.clearValidators();
      this.registerForm.get('emergencyContact')?.clearValidators();
      this.registerForm.get('cpfAssociateds')?.setValidators([Validators.required]);
      this.registerForm.get('birthdate')?.reset();
      this.registerForm.get('emergencyContact')?.reset();
    }

    this.registerForm.updateValueAndValidity();
  }

  onSegmentChange(event: any) {
    this.selectedSegment = event.detail.value;
    this.adjustValidators();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  showErrorToast(message: string) {
    this.errorMessage = message;
    this.isToastOpen = true;
  }

  onToastDismiss() {
    this.isToastOpen = false;
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

  validateCPF(cpf: string): boolean {
    if (!cpf) return false;

    cpf = cpf.replace(/[^\d]/g, '');

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
      return false;
    }

    let sum = 0;
    let rest;

    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf[i - 1]) * (11 - i);
    }
    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(cpf[9])) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf[i - 1]) * (12 - i);
    }
    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(cpf[10])) return false;

    return true;
  }


  onRegister() {
    if (this.registerForm.invalid) {
      this.showErrorToast(this.FORM_ERROR);
      return;
    }

    const cpf = this.registerForm.get('cpf')?.value;
    const cpfAssociateds = this.selectedSegment === 'monitor' ? this.registerForm.get('cpfAssociateds')?.value : null;

    if (!this.validateCPF(cpf)) {
      this.showErrorToast(this.INVALID_CPF_ERROR);
      return;
    }

    if (cpfAssociateds && !this.validateCPF(cpfAssociateds)) {
      this.showErrorToast(this.INVALID_ASSOCIATED_CPF_ERROR);
      return;
    }

    const formData = { ...this.registerForm.value };
    formData['type'] = this.selectedSegment === 'paciente' ? 0 : 1;

    if (this.selectedSegment === 'monitor' && cpfAssociateds) {
      formData['cpfAssociateds'] = [cpfAssociateds];
    }

    if (this.selectedSegment === 'monitor') {
      delete formData['birthdate'];
      delete formData['emergencyContact'];
    } else if (this.selectedSegment === 'paciente') {
      delete formData['cpfAssociateds'];
    }

    this.registerService.register(formData).subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.showErrorToast(this.REGISTRATION_ERROR)
    });
  }

}
