/**
 * ============================================================================
 * TESTS DU SERVICE « AuthServices » — tests d'INTÉGRATION HTTP
 * ============================================================================
 * Changement de philosophie par rapport aux composants : ici on ne mocke PAS
 * le service (c'est LUI qu'on teste) — on mocke LE BACKEND.
 *
 * - provideHttpClient()        : le vrai HttpClient d'Angular.
 * - provideHttpClientTesting() : remplace la couche réseau par un faux
 *   backend contrôlé par le test. AUCUNE requête ne part réellement.
 * - HttpTestingController (httpMock) : la télécommande de ce faux backend.
 *
 * Chaque test suit la même partition en 5 temps :
 *   1. APPELER la méthode du service — avec un .subscribe(), sinon
 *      l'Observable HTTP ne déclenche jamais la requête !
 *   2. INTERCEPTER : httpMock.expectOne(url) — échoue si 0 ou 2+ requêtes
 *      sont parties vers cette URL (c'est déjà une assertion).
 *   3. INSPECTER : req.request.method / req.request.body → l'appel et
 *      ses paramètres.
 *   4. RÉPONDRE : req.flush(données) joue le rôle du serveur (réponse
 *      normale, ou erreur avec { status, statusText }).
 *   5. VÉRIFIER ce que le subscriber a reçu et/ou les effets de bord.
 *
 * Le httpMock.verify() de l'afterEach est le filet de sécurité : il fait
 * échouer tout test qui laisse une requête sans réponse ou en a émis une
 * de trop.
 *
 * Particularité de CE service : son constructor lit localStorage, et login()
 * y écrit le token — d'où le localStorage.clear() AVANT l'injection, et les
 * assertions sur localStorage dans les tests d'effets de bord.
 */
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthServices } from './auth-services';

const API = 'http://localhost:3000';

// La fausse réponse que « le serveur » renverra (même forme que json-server-auth)
const fakeResponse = {
  accessToken: 'fake-jwt',
  user: { id: 1, email: 'test@mail.com', name: 'Test', role: 'user' },
};

describe('AuthServices', () => {
  let service: AuthServices;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage?.clear(); // AVANT l'injection : le constructor lit localStorage !

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AuthServices); // le VRAI service
    httpMock = TestBed.inject(HttpTestingController); // la télécommande du faux backend
  });

  // aucune requête ne doit rester sans réponse ou être partie sans être attendue
  afterEach(() => {
    httpMock?.verify();
    localStorage.clear(); // ne pas polluer les autres fichiers de test
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // test que login envoie un POST /login avec les identifiants
  // (la partition complète en 5 temps, commentée une fois ici)
  it('should POST credentials to /login', () => {
    const credentials = { email: 'test@mail.com', password: 'azerty123' };
    let received: unknown;

    // 1. appeler (le subscribe déclenche la requête et capture la réponse)
    service.login(credentials).subscribe((res) => (received = res));

    // 2. intercepter + 3. inspecter méthode et body
    const req = httpMock.expectOne(`${API}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(credentials);

    // 4. répondre — le « backend » envoie sa réponse
    req.flush(fakeResponse);

    // 5. vérifier ce que le subscriber a reçu
    expect(received).toEqual(fakeResponse);
  });

  // test les EFFETS DE BORD d'un login réussi : token et rôle stockés,
  // signaux mis à jour (c'est le tap() du service qu'on teste ici)
  it('should store token and set isLogged on successful login', () => {
    service.login({ email: 'test@mail.com', password: 'azerty123' }).subscribe();
    httpMock.expectOne(`${API}/login`).flush(fakeResponse);

    expect(localStorage.getItem('token')).toBe('fake-jwt');
    expect(localStorage.getItem('role')).toBe('user');
    expect(service.isLogged()).toBe(true);
    expect(service.isAdmin()).toBe(false); // role 'user' → pas admin
  });

  // test que le rôle admin active isAdmin (variation de la réponse du backend)
  it('should set isAdmin when the logged user is admin', () => {
    service.login({ email: 'admin@mail.com', password: 'admin1234' }).subscribe();
    httpMock.expectOne(`${API}/login`).flush({
      ...fakeResponse,
      user: { ...fakeResponse.user, role: 'admin' },
    });

    expect(service.isAdmin()).toBe(true);
  });

  // test qu'un login refusé ne connecte pas l'utilisateur :
  // flush avec { status: 401 } simule une erreur serveur → l'Observable part
  // en erreur → on vérifie que RIEN n'a été stocké ni activé
  it('should propagate the error and stay logged out on 401', () => {
    let errorStatus = 0;

    service.login({ email: 'test@mail.com', password: 'mauvais' }).subscribe({
      error: (err) => (errorStatus = err.status),
    });
    httpMock
      .expectOne(`${API}/login`)
      .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(errorStatus).toBe(401);
    expect(service.isLogged()).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
  });

  // test que register FORCE le role 'user' (logique métier : personne ne
  // s'inscrit admin) — on envoie volontairement 'admin' pour prouver que
  // c'est bien le service qui l'écrase
  it('should POST to /register with role forced to user', () => {
    service
      .register({ email: 'new@mail.com', password: 'azerty123', name: 'New', role: 'admin' })
      .subscribe();

    const req = httpMock.expectOne(`${API}/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'new@mail.com',
      password: 'azerty123',
      name: 'New',
      role: 'user', // ← forcé par le service
    });
    req.flush(fakeResponse);
  });

  // test que logout remet tout à zéro (on se connecte d'abord, puis logout,
  // puis on vérifie que chaque effet du login a bien été annulé)
  it('should reset signals and clear storage on logout', () => {
    service.login({ email: 'test@mail.com', password: 'azerty123' }).subscribe();
    httpMock.expectOne(`${API}/login`).flush(fakeResponse);

    service.logout();

    expect(service.isLogged()).toBe(false);
    expect(service.isAdmin()).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('role')).toBeNull();
  });
});