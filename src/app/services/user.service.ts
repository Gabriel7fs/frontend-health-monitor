import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private dashboardUrl = 'http://localhost:8080/user/dashboard';
  private updateUserUrl = 'http://localhost:8080/user';
  private updatePasswordUrl = 'http://localhost:8080/user/change-password';

  constructor(private http: HttpClient) { }

  getPacientsByMonitorId(userId: string): Observable<any> {
    const token = localStorage.getItem('authToken');

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any>(`${this.dashboardUrl}?userId=${userId}`, { headers });
  }

  updateUser(userId: string, userData: any): Observable<any> {
    const token = localStorage.getItem('authToken');
    userData["id"] = userId;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });


    return this.http.put<any>(`${this.updateUserUrl}`, userData, { headers })
      .pipe(
        tap(response => {
          console.log('Usuário atualizado com sucesso!', response);
        }),
        catchError(this.handleError)
      );
  }

  updatePassword(passwordData: { cpf: string, password: string, confirmPassword: string }): Observable<any> {
    return this.http.put<any>(this.updatePasswordUrl, passwordData)
      .pipe(
        tap(response => {
          console.log('Senha atualizada com sucesso!', response);
        }),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocorreu um erro desconhecido!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      errorMessage = `Código de erro: ${error.status}\nMensagem: ${error.message}`;
    }
    return throwError(errorMessage);
  }
}
