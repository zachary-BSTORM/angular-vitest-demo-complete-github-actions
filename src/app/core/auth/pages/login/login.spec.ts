/**
 * ============================================================================
 * TESTS DU COMPOSANT « Login »
 * ============================================================================
 * Formulaire réactif (email + password pré-remplis pour la démo) qui appelle
 * AuthServices.login() à la soumission, puis navigue vers /product en cas de
 * succès ou affiche un message d'erreur en cas d'échec.
 *
 * Ce qui est MOCKÉ / ESPIONNÉ :
 * - AuthServices → remplacé par authServiceMock : { login: vi.fn() }.
 *   Dans le beforeEach, mockReturnValue(of(...)) fait renvoyer au mock un
 *   Observable qui émet immédiatement une fausse réponse (login réussi).
 *   Un test particulier le remplace par throwError(...) pour simuler un 401.
 * - Router → on garde le VRAI router (provideRouter) mais on l'ESPIONNE avec
 *   vi.spyOn(router, 'navigateByUrl') : la méthode s'exécute normalement ET
 *   enregistre ses appels pour les assertions. Mock = remplacer ; spy = observer.
 *
 * Techniques de simulation du DOM (jsdom) :
 * - Saisie utilisateur : input.value = '...' PUIS dispatchEvent(new Event('input')).
 *   Assigner .value seul ne suffit pas : c'est l'événement 'input' qui prévient
 *   Angular (ControlValueAccessor) de mettre à jour le FormControl.
 * - Soumission : form.dispatchEvent(new Event('submit')) — c'est l'événement
 *   qu'écoute (ngSubmit). Plus fiable sous jsdom qu'un click sur le bouton.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Login } from './login';
import { AuthServices } from '../../../../shared/services/auth/auth-services';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi, type MockInstance } from 'vitest';

// Mock partiel : uniquement la méthode que le composant consomme
const authServiceMock = {
    login : vi.fn()
}

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let el: HTMLElement;
  let router: Router;
  let navigateSpy: MockInstance;   // MockInstance = le type des spies Vitest


  beforeEach(async () => {
     // Comportement par défaut du mock : un login qui réussit
     authServiceMock.login.mockReturnValue(of({ accessToken: 'fake-jwt', user: { id: 1 } }));

    await TestBed.configureTestingModule({
      imports: [Login],
      providers : [provideRouter([]),{provide : AuthServices , useValue :authServiceMock} ]
    }).compileComponents();

 fixture = TestBed.createComponent(Login);
  el = fixture.nativeElement;
  router = TestBed.inject(Router);              // récupère le VRAI router du TestBed
  navigateSpy = vi.spyOn(router, 'navigateByUrl'); // ... et pose un espion dessus
  fixture.detectChanges();                      // premier rendu
  authServiceMock.login.mockClear();            // remet le compteur d'appels à zéro
  });

  // test la création du composant
  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  // test que la soumission envoie au service les valeurs du formulaire
  // (ici les valeurs par défaut, le form étant pré-rempli)
  it('should call login with form values on submit', () => {
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    expect(authServiceMock.login).toHaveBeenCalledWith({
      email: 'admin@mail.com',
      password: 'admin1234',
    });
  });

  // test la navigation vers /product après un login réussi
  // (le mock renvoie of(...) → le subscribe reçoit next → navigateByUrl)
  it('should navigate to /product on successful login', () => {
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    expect(navigateSpy).toHaveBeenCalledWith('/product');
  });

  // test qu'un formulaire INVALIDE ne déclenche PAS l'appel au service :
  // on vide l'email (requis) → le if(this.loginForm.valid) bloque
  it('should not call login when form is invalid', () => {
    const emailInput = el.querySelector<HTMLInputElement>('input[formControlName="email"]')!;
    emailInput.value = '';
    emailInput.dispatchEvent(new Event('input'));   // ← informe le FormControl
    fixture.detectChanges();

    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    expect(authServiceMock.login).not.toHaveBeenCalled();
  });

  // test le scénario d'échec : le mock renvoie une erreur (throwError) →
  // pas de navigation ET le message d'erreur apparaît dans le DOM
  it('should show an error and not navigate when login fails', () => {
    authServiceMock.login.mockReturnValue(throwError(() => new Error('401')));

    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();   // re-rendu pour afficher le message (signal mis à jour)

    expect(navigateSpy).not.toHaveBeenCalled();
    expect(el.textContent).toContain('Email ou mot de passe incorrect');
  });

  // test « visuel » : le binding formulaire → DOM fonctionne, les valeurs par
  // défaut du FormGroup sont bien visibles dans les inputs
  it('should render the form with default values', () => {
    const emailInput = el.querySelector<HTMLInputElement>('input[formControlName="email"]')!;
    const passwordInput = el.querySelector<HTMLInputElement>('input[formControlName="password"]')!;
    expect(emailInput.value).toBe('admin@mail.com');
    expect(passwordInput.value).toBe('admin1234');
  });

  // le miroir du test d'erreur : PAS de message au départ. Sans ce test, un
  // message affiché en permanence (codé en dur) passerait le test d'erreur !
  it('should not show an error message initially', () => {
    expect(el.textContent).not.toContain('Email ou mot de passe incorrect');
  });

});
