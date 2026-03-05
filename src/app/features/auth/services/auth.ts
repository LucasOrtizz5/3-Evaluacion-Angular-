import { Injectable } from '@angular/core';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly STORAGE_KEY = 'currentUser';

  register(user: User): void {
    //Utilizo stringify para guardar el objeto user en localStorage, ya que localStorage solo puede almacenar strings.
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
  }

  getCurrentUser(): User | null {
    const data = localStorage.getItem(this.STORAGE_KEY);
    //Se obtiene el item y convierte el string en un objeto User. Si no hay datos, devuelve null.
    return data ? JSON.parse(data) : null;
  }

  //Metodo para saber si el usuario esta logueado, verificando si hay un usuario almacenado en localStorage.
  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.STORAGE_KEY);
  }

  getUser(): User | null {
    const user = localStorage.getItem(this.STORAGE_KEY);
    return user ? JSON.parse(user) : null;
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
