import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  showPassword = false;
  isToastOpen = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private loginService: LoginService,
    private navCtrl: NavController
  ) {
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      cpf: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(14)]],
      password: ['', [Validators.required]]
    });
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
      return input.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (input.length > 6) {
      return input.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (input.length > 3) {
      return input.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }
    return input;
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

  forgotPassword() {
    this.router.navigate(['/new-password']);
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.loginService.login(this.loginForm.value).subscribe({
        next: response => {
          this.navCtrl.navigateRoot('/home');
        },
        error: error => {
          this.showErrorToast('Usuário ou senha incorretos');
        }
      });
    } else {
      this.showErrorToast('Por favor, preencha todos os campos corretamente.');
    }
  }

}
