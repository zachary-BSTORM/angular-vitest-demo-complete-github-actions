/**
 * ============================================================================
 * TESTS DU GUARD « authGuard »
 * ============================================================================
 * Le guard protège les routes /product : connecté → accès autorisé (true) ;
 * non connecté → accès bloqué (false) + redirection.
 *
 * Particularité : un guard FONCTIONNEL (CanActivateFn) est une simple fonction
 * qui appelle inject() pour récupérer ses dépendances. Or inject() ne
 * fonctionne que pendant une phase d'injection Angular → si on appelait
 * authGuard(...) directement, on aurait l'erreur NG0203. La solution
 * officielle : TestBed.runInInjectionContext(...), enveloppé ici dans le
 * helper « executeGuard » généré par le CLI Angular.
 *
 * Ce qui est mocké :
 * - AuthServices → { isLogged: signal } : le guard ne lit QUE ce signal,
 *   le mock ne contient donc que lui. Le test le pilote avec .set().
 * - Router → réel (provideRouter) + spy sur navigateByUrl pour vérifier
 *   la redirection ET son URL.
 *
 * À noter : pas de fixture, pas de DOM, pas de compileComponents — un guard
 * se teste comme une fonction pure. C'est le spec le plus court du projet.
 * Les « {} as ...Snapshot » sont des casts assumés : le guard n'utilise ni
 * route ni state, on ne fabrique pas ce qu'on ne consomme pas.
 */
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, CanActivateFn, provideRouter, Router, RouterStateSnapshot } from '@angular/router';

import { authGuard } from './auth-guard';
import { vi, type MockInstance } from 'vitest';
import { signal } from '@angular/core';
import { AuthServices } from '../../../shared/services/auth/auth-services';

const isLoggedMock = signal(false)
const authServiceMock = {
  isLogged : isLoggedMock,
}

describe('authGuard', () => {

  let navigateSpy : MockInstance;

  // Wrapper généré par le CLI : relaie les arguments au guard en l'exécutant
  // dans un contexte d'injection valide (sinon inject() → erreur NG0203)
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));



  beforeEach(() => {
    isLoggedMock.set(false)   // état par défaut : non connecté (isolation)

    TestBed.configureTestingModule({
      providers : [provideRouter([]),{provide : AuthServices , useValue : authServiceMock}]
    });

    // espion sur la méthode de redirection réellement utilisée par le guard
    navigateSpy = vi.spyOn(TestBed.inject(Router),'navigateByUrl')

  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  // connecté → accès autorisé, pas de redirection.
  // Chaque test vérifie les DEUX faces du contrat (retour + navigation) :
  // quand ça passe, on prouve aussi qu'il n'y a PAS eu de redirection.
  it('should allow access when logged', () => {
    isLoggedMock.set(true);

    const result = executeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);

    expect(result).toBe(true);
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  // non connecté → accès bloqué + redirection vers /login.
  // (pas besoin de set(false) : le beforeEach l'a déjà fait)
  it('should block and redirect when not logged', () => {
    const result = executeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);

    expect(result).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith('/login');
  });

});
