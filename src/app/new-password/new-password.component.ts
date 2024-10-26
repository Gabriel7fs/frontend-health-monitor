import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.scss'],
})
export class NewPasswordComponent implements OnInit {
  newPasswordForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isToastOpen = false;
  isErrorToastOpen = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
  ) { }

  ngOnInit() {
    this.newPasswordForm = this.formBuilder.group({
      cpf: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(14)]],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  onToastDismiss() {
    this.isToastOpen = false;
  }

  onErrorToastDismiss() {
    this.isErrorToastOpen = false;
  }

  showErrorToast(message: string) {
    this.errorMessage = message;
    this.isErrorToastOpen = true;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
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

  onSubmit() {
    if (this.newPasswordForm.valid) {
      const { cpf, password, confirmPassword } = this.newPasswordForm.value;
      if (password === confirmPassword) {
        this.userService.updatePassword({ cpf, password, confirmPassword }).subscribe({
          next: response => {
            this.isToastOpen = true;
          },
          error: error => {
            this.showErrorToast('Erro ao atualizar a senha.');
          }
        });
      } else {
        this.showErrorToast('As senhas não correspondem.');
      }
    } else {
      this.showErrorToast('Por favor, preencha os campos corretamente.');
    }
  }
}
