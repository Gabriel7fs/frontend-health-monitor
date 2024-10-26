// src/app/services/register.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  private apiUrl = 'http://localhost:8080/user';

  constructor(private http: HttpClient) {}

  register(userData: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    if (userData.type === 0) {
      userData.birthdate = userData.birthdate.replaceAll('/', '-');

      userData.emergencyContact = userData.emergencyContact.replace(/[^\d]/g, '');
    }

    return this.http.post<any>(this.apiUrl, userData, httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: any) {
    let errorMessage = '';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      errorMessage = `Código do erro: ${error.status}\nMensagem: ${error.message}`;
    }

    return throwError(() => new Error(errorMessage));
  }
}
