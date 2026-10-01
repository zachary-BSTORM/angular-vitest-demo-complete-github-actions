/**
 * ============================================================================
 * TESTS DU SERVICE « ProductServices » — tests d'INTÉGRATION HTTP
 * ============================================================================
 * Même philosophie que auth-services.spec : on teste le VRAI service, et on
 * mocke le BACKEND avec provideHttpClientTesting() + HttpTestingController.
 * (Voir l'en-tête de auth-services.spec pour l'explication détaillée de la
 * partition en 5 temps : appeler → intercepter → inspecter → répondre →
 * vérifier.)
 *
 * Ici on couvre le CRUD complet du service, soit pour chaque méthode :
 * - l'URL exacte appelée (y compris l'id dans l'URL pour getById/update/delete)
 * - la méthode HTTP (GET / POST / PUT / DELETE)
 * - le body envoyé (POST / PUT)
 * - la réponse transmise au subscriber
 * ... et un cas d'erreur (404) pour vérifier que l'erreur est bien propagée
 * à l'appelant (c'est le composant qui décidera quoi afficher).
 */
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProductServices } from './product-services';

const fakeProduct = {
  id: 1, name: 'Clavier', description: 'Clavier mécanique',
  price: 49, quantity: 10, image: 'https://exemple.com/clavier.jpg',
};

describe('ProductServices', () => {
  let service: ProductServices;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductServices);
    httpMock = TestBed.inject(HttpTestingController);
  });

  // filet de sécurité : échoue si une requête est restée sans réponse
  // ou si une requête inattendue est partie
  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // test GET de la liste : bonne URL, bonne méthode, réponse transmise telle quelle
  it('should GET all products', () => {
    let received: unknown;
    service.getProducts().subscribe((res) => (received = res));

    const req = httpMock.expectOne('http://localhost:3000/product');
    expect(req.request.method).toBe('GET');
    req.flush([fakeProduct]);   // le « serveur » répond un tableau

    expect(received).toEqual([fakeProduct]);
  });

  // test GET par id — l'id fait partie de l'URL (expectOne vérifie l'URL EXACTE)
  it('should GET a product by id', () => {
    let received: unknown;
    service.getById(1).subscribe((res) => (received = res));

    const req = httpMock.expectOne('http://localhost:3000/product/1');
    expect(req.request.method).toBe('GET');
    req.flush(fakeProduct);

    expect(received).toEqual(fakeProduct);
  });

  // test POST de création — le body est le nouveau produit (sans id),
  // la réponse contient l'id généré par le serveur
  it('should POST a new product', () => {
    const newProduct = { name: 'Souris', description: 'Souris sans fil',
      price: 25, quantity: 5, image: 'https://exemple.com/souris.jpg' };
    let received: unknown;

    service.create(newProduct).subscribe((res) => (received = res));

    const req = httpMock.expectOne('http://localhost:3000/product');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newProduct);
    req.flush({ id: 2, ...newProduct });   // json-server renvoie l'objet avec l'id généré

    expect(received).toEqual({ id: 2, ...newProduct });
  });

  // test PUT de mise à jour — l'id dans l'URL, les nouvelles valeurs dans le
  // body (rappel : PUT REMPLACE la ressource entière côté json-server)
  it('should PUT the updated product to its url', () => {
    const update = { name: 'Clavier gamer', description: 'RGB',
      price: 89, quantity: 3, image: 'https://exemple.com/gamer.jpg' };

    service.update(update, 1).subscribe();

    const req = httpMock.expectOne('http://localhost:3000/product/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(update);
    req.flush({ id: 1, ...update });
  });

  // test DELETE par id — pas de body, juste la bonne URL et la bonne méthode
  it('should DELETE the product by id', () => {
    service.delete(1).subscribe();

    const req = httpMock.expectOne('http://localhost:3000/product/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  // test qu'une erreur serveur est propagée à l'appelant :
  // flush avec { status: 404 } → l'Observable part en erreur → le composant
  // abonné recevra err.status et pourra réagir
  it('should propagate a 404 error', () => {
    let errorStatus = 0;
    service.getById(99).subscribe({
      error: (err) => (errorStatus = err.status),
    });

    httpMock.expectOne('http://localhost:3000/product/99')
      .flush('Not found', { status: 404, statusText: 'Not Found' });

    expect(errorStatus).toBe(404);
  });
});
