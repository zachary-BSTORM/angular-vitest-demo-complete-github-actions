/**
 * ============================================================================
 * TESTS DU COMPOSANT « ProductList »
 * ============================================================================
 * Au ngOnInit, le composant demande la liste au service et la stocke dans un
 * signal ; le template la rend avec @for ; chaque item a un bouton Details
 * qui navigue vers /product/details/:id.
 *
 * Ce qui est mocké :
 * - ProductServices → { getProducts: vi.fn() } qui renvoie of(fakeProducts) :
 *   un Observable qui émet IMMÉDIATEMENT nos données de test. Le composant
 *   ne sait pas qu'il parle à un mock — il s'abonne, reçoit, affiche.
 * - Router → réel + spy sur navigate (le composant utilise navigate([...]),
 *   avec un tableau de segments — à ne pas confondre avec navigateByUrl).
 *
 * Choix des données de test (important !) :
 * - DEUX produits, pas un : avec un seul, on ne prouverait pas que le @for
 *   itère (un template codé en dur passerait le test).
 * - Dans le test de navigation, on clique sur le DEUXIÈME bouton et on attend
 *   l'id 2 : cliquer le premier et attendre 1 passerait aussi avec un
 *   composant bogué qui enverrait toujours le premier id.
 *   → Toujours choisir la donnée qui DISTINGUE le comportement correct
 *     d'un comportement plausible mais faux.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ProductList } from './product-list';
import { ProductServices } from '../../../shared/services/product/product-services';

const productServiceMock = {
  getProducts: vi.fn(),
};

// Données de test réutilisées par plusieurs tests
const fakeProducts = [
  { id: 1, name: 'Clavier', description: 'Clavier mécanique', price: 49, quantity: 10, image: 'https://exemple.com/clavier.jpg' },
  { id: 2, name: 'Souris', description: 'Souris sans fil', price: 25, quantity: 5, image: 'https://exemple.com/souris.jpg' },
];

describe('ProductList', () => {
  let fixture: ComponentFixture<ProductList>;
  let el: HTMLElement;

  beforeEach(async () => {
    productServiceMock.getProducts.mockClear();                    // isolation
    productServiceMock.getProducts.mockReturnValue(of(fakeProducts)); // réponse par défaut

    await TestBed.configureTestingModule({
      imports: [ProductList],
      providers: [
        provideRouter([]),
        { provide: ProductServices, useValue: productServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductList);
    el = fixture.nativeElement;
    fixture.detectChanges();   // déclenche ngOnInit → getProducts → rendu de la liste
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  // test que la liste est chargée au démarrage (le ngOnInit fait son travail)
  it('should fetch the products on init', () => {
    expect(productServiceMock.getProducts).toHaveBeenCalled();
  });

  // test qu'un élément est rendu PAR produit, avec ses données :
  // 2 produits mockés → 2 <li>, et on vérifie un échantillon du contenu
  it('should render one item per product', () => {
    const items = el.querySelectorAll('li');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('Clavier');
    expect(items[0].textContent).toContain('49€');
    expect(items[1].textContent).toContain('Souris');
    expect(items[1].querySelector('img')?.src).toBe('https://exemple.com/souris.jpg');
  });

  // test l'état « liste vide » : on reprogramme le mock pour renvoyer [],
  // puis on crée une NOUVELLE fixture (celle du beforeEach a déjà reçu les
  // 2 produits — trop tard pour elle)
  it('should render no item when there is no product', () => {
    productServiceMock.getProducts.mockReturnValue(of([]));
    const emptyFixture = TestBed.createComponent(ProductList);
    emptyFixture.detectChanges();
    expect((emptyFixture.nativeElement as HTMLElement).querySelectorAll('li').length).toBe(0);
  });

  // test que le bouton Details navigue avec l'id DU produit cliqué :
  // on clique le 2e bouton et on attend l'id 2 → prouve que chaque bouton
  // porte bien l'id de SON produit (binding correct dans le @for)
  it('should navigate to details with the id of the clicked product', () => {
    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate');
    const buttons = el.querySelectorAll<HTMLButtonElement>('button');

    buttons[1].click();   // ← on clique sur le DEUXIÈME produit

    expect(navigateSpy).toHaveBeenCalledWith(['/product/details', 2]);
  });
});
