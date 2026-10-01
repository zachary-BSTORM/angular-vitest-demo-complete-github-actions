/**
 * ============================================================================
 * TESTS DU COMPOSANT « Navbar »
 * ============================================================================
 * La navbar affiche des liens différents selon que l'utilisateur est connecté
 * ou non (signal isLogged de AuthServices), et délègue le logout au service.
 *
 * Ce qui est MOCKÉ et pourquoi :
 * - AuthServices est remplacé par un objet « maison » (authServiceMock) qui ne
 *   contient QUE ce que la navbar consomme :
 *     - isLogged : un VRAI signal writable → le test peut le piloter avec
 *       .set(true/false) pour simuler connecté / non connecté ;
 *     - logout   : vi.fn(), une fonction espionne de Vitest qui enregistre
 *       ses appels → on peut vérifier qu'elle a été appelée.
 *   Règle : on mocke les DÉPENDANCES du composant testé, jamais le composant.
 *
 * Points techniques à retenir :
 * - provideRouter([]) : requis car le template contient des routerLink.
 * - Après chaque isLoggedMock.set(...), il faut fixture.detectChanges() pour
 *   que le DOM soit re-rendu : en test, le rendu est piloté manuellement.
 * - Le beforeEach REMET le signal à false et nettoie le spy (mockClear) :
 *   sans ça, l'état d'un test fuiterait dans le suivant.
 * - Sélecteur 'a[routerLink="/..."]' : fonctionne car routerLink est écrit en
 *   attribut STATIQUE dans le template (il reste donc visible dans le DOM).
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Navbar } from './navbar';
import { provideRouter } from '@angular/router';

import { signal } from '@angular/core';
import { vi } from 'vitest';
import { AuthServices } from '../../services/auth/auth-services';

// Le mock vit au niveau du module : le signal et le spy sont donc PARTAGÉS
// entre les tests → d'où l'importance du reset dans le beforeEach.
const isLoggedMock = signal(false);
const authServiceMock = {
  isLogged: isLoggedMock,
  logout: vi.fn(),
};

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;
  let el: HTMLElement;

  beforeEach(async () => {
    // Remise à zéro de l'état des mocks AVANT chaque test (isolation)
    isLoggedMock.set(false)
    authServiceMock.logout.mockClear();


    TestBed.configureTestingModule({
      imports: [Navbar],
      // provideRouter : le vrai router (pour routerLink)
      // { provide, useValue } : « quand quelqu'un demande AuthServices,
      //   donne-lui authServiceMock à la place » → c'est LE mécanisme de mock
      //   via l'injection de dépendances d'Angular.
      providers : [provideRouter([]),{provide : AuthServices,useValue : authServiceMock}]
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    el = fixture.nativeElement;   // el typé HTMLElement → querySelector typés
    fixture.detectChanges();
  });

  // test la création du composant
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // test le non affichage du logout si le signal est à false
  // (état par défaut posé par le beforeEach : non connecté)
  it('should hide Product link and Logout button when not logged', () => {
    expect(fixture.nativeElement.querySelector('a[routerLink="/product"]')).toBeNull();
    expect(el.querySelector('#logout')).toBeNull();
  });

  // test l'affichage du logout si le signal est à true
  // On pilote le signal PUIS on re-rend le DOM : set → detectChanges → assert
  it('should show Product link and Logout button when logged', () => {
    isLoggedMock.set(true);
    fixture.detectChanges();
    expect(el.querySelector('a[routerLink="/product"]')).toBeTruthy();
    expect(el.querySelector('#logout')).toBeTruthy();
  });

  // vérifie les liens présents dans la navbar (leur destination, pas leur texte)
  it('should have links to home, register and login', () => {
    const links = Array.from(el.querySelectorAll('a')).map(a => a.getAttribute('routerLink'));
    expect(links).toContain('/');
    expect(links).toContain('/register');
    expect(links).toContain('/login');
  });

  // test l'appel du service lors du déclenchement de logout :
  // on simule un VRAI clic utilisateur sur le bouton, puis on vérifie que la
  // navbar a bien DÉLÉGUÉ au service (on ne teste pas ce que logout() fait —
  // ça, c'est le rôle de auth-services.spec).
  it('should call authService.logout on click', () => {
    isLoggedMock.set(true);
    fixture.detectChanges();
    el.querySelector<HTMLButtonElement>('#logout')?.click()
    expect(authServiceMock.logout).toHaveBeenCalled();
  });

  // Les tests suivants couvrent l'affichage conditionnel lien par lien,
  // dans les DEUX états (connecté / non connecté). Tester les deux états est
  // essentiel : un élément affiché en permanence passerait un test « visible »
  // mais échouerait le test « caché ».

  it('should show Register link when not logged' , () => {
    expect(el.querySelector('a[routerLink="/register"]')).toBeTruthy();
  })

  it('should hide Register link when logged' , () => {
    isLoggedMock.set(true)
    fixture.detectChanges()
    expect(el.querySelector('a[routerLink="/register"]')).toBeFalsy();
  })

  it('should show Login link when not logged' , () => {
    expect(el.querySelector('a[routerLink="/login"]')).toBeTruthy();
  })

  it('should hide Login link when logged' , () => {
    isLoggedMock.set(true)
    fixture.detectChanges()
    expect(el.querySelector('a[routerLink="/login"]')).toBeFalsy();
  })


  it('should hide Product link when not logged' , () => {
    expect(el.querySelector('a[routerLink="/product"]')).toBeFalsy();
  })

  it('should show Product link when logged' , () => {
    isLoggedMock.set(true)
    fixture.detectChanges()
    expect(el.querySelector('a[routerLink="/product"]')).toBeTruthy();
  })
});
