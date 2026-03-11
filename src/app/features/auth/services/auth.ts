import { Injectable, computed, signal } from '@angular/core';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly STORAGE_KEY = 'currentUser';
  private readonly USERS_KEY = 'registeredUsers';
  private readonly currentUserState = signal<User | null>(this.readStoredUser());

  readonly currentUser = computed(() => this.currentUserState());
  readonly authenticated = computed(() => !!this.currentUserState());

  // Registro de un nuevo usuario, guardando su información en localStorage
  register(user: User): void {
    // Se utiliza stringify para convertir el objeto user en un string antes de guardarlo en localStorage, ya que localStorage solo puede almacenar strings.
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    this.currentUserState.set(user);

    // Guardar en lista de usuarios registrados para login
    const registeredUsers = this.getAllRegisteredUsers();
    registeredUsers.push(user);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(registeredUsers));
  }

  // Login de un usuario, verificando sus credenciales contra los usuarios registrados en localStorage.
  login(email: string, password: string): { success: boolean; message: string } {
    const registeredUsers = this.getAllRegisteredUsers();

    const user = registeredUsers.find(u => u.email === email && u.password === password);

    if (user) {
      // Si el usuario existe y las credenciales son correctas, lo establece como usuario actual
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      this.currentUserState.set(user);
      return { success: true, message: 'Sesión iniciada correctamente' };
    }

    return { success: false, message: 'Email o contraseña incorrectos' };
  }

  private getAllRegisteredUsers(): User[] {
    const data = localStorage.getItem(this.USERS_KEY);
    return data ? JSON.parse(data) : [];
  }

  emailExists(email: string): boolean {
    const registeredUsers = this.getAllRegisteredUsers();
    return registeredUsers.some(u => u.email === email);
  }

  getCurrentUser(): User | null {
    return this.currentUserState();
  }

  //Metodo para saber si el usuario esta logueado, verificando si hay un usuario almacenado en localStorage.
  isAuthenticated(): boolean {
    return this.authenticated();
  }

  getUser(): User | null {
    return this.currentUserState();
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentUserState.set(null);
  }

  private readStoredUser(): User | null {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }
}
