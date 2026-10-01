/**
 * ============================================================================
 * TESTS DU COMPOSANT « Register »
 * ============================================================================
 * Formulaire réactif VIDE au départ (email, password, name) avec validators
 * et messages d'erreur de validation affichés champ par champ
 * (condition template : contrôle dirty ET invalid).
 *
 * Différences pédagogiques avec login.spec :
 * - Le formulaire démarre vide → chaque test de soumission doit d'abord
 *   SAISIR les champs. D'où les helpers en tête de describe :
 *     fillInput      : remplit UN champ et déclenche l'événement 'input'
 *                      (c'est cet événement qui synchronise le FormControl
 *                      ET qui rend le contrôle « dirty », comme une vraie frappe) ;
 *     fillValidForm  : remplit tout le formulaire avec des valeurs valides ;
 *     submitForm     : soumet + re-rend le DOM.
 *   Factoriser dans des helpers garde chaque test court et LISIBLE.
 * - On teste aussi les MESSAGES DE VALIDATION (email invalide, password trop
 *   court) — c'est la partie « champ requis vide → contrôle invalide » du
 *   tableau de la démo.
 *
 * Mocks : AuthServices.register → vi.fn() (of(...) = succès par défaut,
 * throwError(...) dans le test d'échec). Router réel + spy sur navigateByUrl.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Register } from './register';
import { AuthServices } from '../../../../shared/services/auth/auth-services';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi, type MockInstance } from 'vitest';

const authServiceMock = {
  register: vi.fn(),
};

describe('Register', () => {
  let fixture: ComponentFixture<Register>;
  let el: HTMLElement;
  let router: Router;
  let navigateSpy: MockInstance;

  // remplit un input et notifie le FormControl (via l'événement 'input')
  const fillInput = (name: string, value: string) => {
    const input = el.querySelector<HTMLInputElement>(`input[formControlName="${name}"]`)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  };

  // remplit tout le formulaire avec des valeurs valides
  const fillValidForm = () => {
    fillInput('email', 'jean@mail.com');
    fillInput('password', 'azerty123');
    fillInput('name', 'Jean');
    fixture.detectChanges();
  };

  // soumet le formulaire (l'événement 'submit' déclenche (ngSubmit))
  const submitForm = () => {
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    // par défaut : une inscription qui réussit
    authServiceMock.register.mockReturnValue(of({ accessToken: 'fake-jwt', user: { id: 1 } }));

    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([]), { provide: AuthServices, useValue: authServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    el = fixture.nativeElement;
    router = TestBed.inject(Router);
    navigateSpy = vi.spyOn(router, 'navigateByUrl');
    fixture.detectChanges();
    authServiceMock.register.mockClear();   // isolation entre tests
  });

  // test la création du composant
  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  // test qu'aucun message d'erreur n'est affiché au départ.
  // C'est la moitié « avant » du contrat : les @if de validation ne doivent
  // s'activer QUE quand les champs sont touchés et invalides.
  it('should not show any error message initially', () => {
    expect(el.textContent).not.toContain("L'email est incorrect");
    expect(el.textContent).not.toContain('Le mot de passe est incorrect');
    expect(el.textContent).not.toContain("L'inscription a échoué");
  });

  // test l'affichage du message d'erreur email quand le champ est touché
  // et invalide (dirty + invalid) — la saisie simulée rend le contrôle dirty
  it('should show email error when email is dirty and invalid', () => {
    fillInput('email', 'pas-un-email');   // ne passe pas Validators.email
    fixture.detectChanges();
    expect(el.textContent).toContain("L'email est incorrect");
  });

  // test l'affichage du message d'erreur password quand le champ est touché
  // et invalide
  it('should show password error when password is dirty and invalid', () => {
    fillInput('password', 'abc');   // trop court pour le minLength
    fixture.detectChanges();
    expect(el.textContent).toContain('Le mot de passe est incorrect');
  });

  // test que le service reçoit EXACTEMENT les valeurs saisies à la soumission
  it('should call register with form values on submit', () => {
    fillValidForm();
    submitForm();
    expect(authServiceMock.register).toHaveBeenCalledWith({
      email: 'jean@mail.com',
      password: 'azerty123',
      name: 'Jean',
    });
  });

  // test la navigation vers /product après une inscription réussie
  it('should navigate to /product on successful register', () => {
    fillValidForm();
    submitForm();
    expect(navigateSpy).toHaveBeenCalledWith('/product');
  });

  // test qu'un formulaire invalide ne déclenche pas d'appel au service
  // (seul l'email est rempli, et mal → loginForm.valid est false)
  it('should not call register when form is invalid', () => {
    fillInput('email', 'pas-un-email');
    fixture.detectChanges();
    submitForm();
    expect(authServiceMock.register).not.toHaveBeenCalled();
  });

  // test le scénario d'échec API : le mock renvoie une erreur → pas de
  // navigation, et le message d'erreur du composant est rendu.
  // ATTENTION : la chaîne attendue doit être EXACTEMENT celle que le
  // composant écrit dans son signal errorMessage (couplage assumé).
  it('should show an error and not navigate when register fails', () => {
    authServiceMock.register.mockReturnValue(throwError(() => new Error('400')));
    fillValidForm();
    submitForm();
    expect(navigateSpy).not.toHaveBeenCalled();
    expect(el.textContent).toContain("informations incorrectes");
  });

});
