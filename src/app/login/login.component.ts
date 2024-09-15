import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {

  loginForm!: FormGroup;
  showPassword = false;

  constructor(private formBuilder: FormBuilder) {
    this.createLoginForm();
  }


  createLoginForm() {
    this.loginForm = this.formBuilder.group({
      cpf: [
        '',
        Validators.compose([
          Validators.required,
          Validators.maxLength(14)
        ])
      ],
      password: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(30)
        ])
      ]
    })
  }

  applyCPFMask(event: any) {
    let input = event.target.value.replace(/\D/g, '');

    if (input.length > 11) {
      input = input.substring(0, 11);
    }

    if (input.length > 3 && input.length <= 6) {
      input = input.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    } else if (input.length > 6 && input.length <= 9) {
      input = input.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (input.length > 9) {
      input = input.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    }

    this.loginForm.get('cpf')?.setValue(input, { emitEvent: false });
  }


  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    if (this.loginForm.valid) {
      let { cpf, password } = this.loginForm.value;

      cpf = cpf.replace(/\./g, '').replace(/-/g, '');

      console.log('Logging in with', cpf, password);
      // lógica para autenticação
    }
  }
}
