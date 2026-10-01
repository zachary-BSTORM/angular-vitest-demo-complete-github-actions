/**
 * ============================================================================
 * TESTS DU COMPOSANT « ProductDetails »
 * ============================================================================
 * La page lit l'id dans l'URL (ActivatedRoute), demande le produit au
 * service, l'affiche, et son bouton Update navigue vers /product/update/:id.
 *
 * Ce qui est mocké :
 * - ActivatedRoute → { snapshot: { params: { id: '1' } } } : on simule une
 *   URL /product/details/1. L'id est fourni en STRING (comme dans une vraie
 *   URL) — c'est le composant qui doit le convertir en number avec « + ».
 * - ProductServices → { getById: vi.fn() } renvoyant of(fakeProduct) :
 *   la réponse arrive immédiatement. Un test utilise NEVER (un Observable
 *   qui n'émet JAMAIS) pour figer le composant dans l'état « en attente du
 *   serveur » et photographier ce qui s'affiche AVANT la réponse.
 * - Router → réel + spy sur navigate (ce composant utilise
 *   navigate(['/product/update', id]) avec un TABLEAU de segments,
 *   contrairement aux autres pages qui utilisent navigateByUrl('...')).
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { NEVER, of } from 'rxjs';
import { vi } from 'vitest';
import { ProductDetails } from './product-details';
import { ProductServices } from '../../../shared/services/product/product-services';

const productServiceMock = {
  getById: vi.fn(),
};

const fakeProduct = {
  id: 1,
  name: 'Clavier',
  description: 'Clavier mécanique',
  price: 49,
  quantity: 10,
  image: 'https://exemple.com/clavier.jpg',
};

describe('ProductDetails', () => {
  let fixture: ComponentFixture<ProductDetails>;
  let el: HTMLElement;

  beforeEach(async () => {
    productServiceMock.getById.mockClear();
    productServiceMock.getById.mockReturnValue(of(fakeProduct));

    await TestBed.configureTestingModule({
      imports: [ProductDetails],
      providers: [
        provideRouter([]),
        // la route mockée : l'id arrive en string, comme dans une vraie URL
        { provide: ActivatedRoute, useValue: { snapshot: { params: { id: '1' } } } },
        { provide: ProductServices, useValue: productServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetails);
    el = fixture.nativeElement;
    fixture.detectChanges();   // déclenche ngOnInit → getById → set du signal → rendu
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  // test que l'id de la route est converti en number et passé au service.
  // On attend 1 (number) et pas '1' (string) : si quelqu'un supprime le « + »
  // de conversion dans le composant, ce test échoue.
  it('should fetch the product with the id from the route', () => {
    expect(productServiceMock.getById).toHaveBeenCalledWith(1);
  });

  // test l'affichage des données du produit après la réponse (partie visuelle)
  it('should display the product details', () => {
    expect(el.querySelector('h3')?.textContent).toBe('Clavier');
    expect(el.textContent).toContain('Clavier mécanique');
    expect(el.textContent).toContain('49€');
    expect(el.textContent).toContain('10pc');
    expect(el.querySelector('img')?.src).toBe('https://exemple.com/clavier.jpg');
  });

  // test que RIEN n'est affiché tant que la réponse n'est pas arrivée :
  // NEVER fige l'attente, et on crée une NOUVELLE fixture (celle du
  // beforeEach a déjà reçu sa réponse — trop tard pour elle)
  it('should not display the product section before the response', () => {
    productServiceMock.getById.mockReturnValue(NEVER);
    const pendingFixture = TestBed.createComponent(ProductDetails);
    pendingFixture.detectChanges();
    const pendingEl: HTMLElement = pendingFixture.nativeElement;
    expect(pendingEl.querySelector('section')).toBeNull();
  });

  // test la navigation vers update avec le bon id au clic sur le bouton :
  // le spy porte sur navigate → l'assertion attend le TABLEAU de segments
  it('should navigate to update with the product id on click', () => {
    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate');
    el.querySelector('button')!.click();
    expect(navigateSpy).toHaveBeenCalledWith(['/product/update', 1]);
  });
});
