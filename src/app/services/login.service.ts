import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private loginUrl =  'http://localhost:8080/api/auth/login';
  // private loginUrl =  'https://thehealthmonitor.cloud/api/auth/login';

  constructor(
    private http: HttpClient,
    private websocketService: WebsocketService,
  ) { }

  login(credentials: { cpf: string, password: string }): Observable<any> {
    return this.http.post<any>(this.loginUrl, credentials)
      .pipe(
        tap(response => {
          console.log(response);
          const userId = response.user.id;
          this.websocketService.connect(userId);
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
        }),
        catchError(this.handleError)
      );
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken');
  }

  private handleError(error: any) {
    let errorMessage = 'Ocorreu um erro desconhecido!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      errorMessage = `Código de erro: ${error.status}\nMensagem: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
