/**
 * ============================================================================
 * TESTS DU COMPOSANT « ProductUpdate »
 * ============================================================================
 * La page charge le produit depuis l'id de l'URL, PRÉ-REMPLIT le formulaire
 * (patchValue), permet de modifier puis soumettre (PUT), et propose aussi la
 * suppression. Pendant le chargement, un état « Chargement ... » s'affiche.
 *
 * Ce qui est mocké :
 * - ActivatedRoute → { snapshot: { params: { id: '1' } } } (id en string,
 *   comme une vraie URL — le composant le convertit avec « + »).
 * - ProductServices → 3 méthodes espionnes : getById (of(fakeProduct) par
 *   défaut, NEVER dans le test de chargement), update et delete.
 *   vi.clearAllMocks() dans le beforeEach nettoie les 3 spies d'un coup.
 * - Router → réel + spy sur navigateByUrl.
 *
 * Les tests remarquables :
 * - « prefill » : on lit les .value des inputs DANS LE DOM → preuve de bout
 *   en bout que getById → patchValue → rendu fonctionne. Attention : le DOM
 *   parle toujours en string ('49'), même pour un input type="number".
 * - « edited values » : on MODIFIE un champ avant de soumettre → prouve que
 *   c'est l'état ACTUEL du formulaire qui part (patch + édition), pas les
 *   données d'origine. Un submit sans modification ne le prouverait pas.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { NEVER, of, throwError } from 'rxjs';
import { vi, type MockInstance } from 'vitest';
import { ProductUpdate } from './product-update';
import { ProductServices } from '../../../shared/services/product/product-services';

const productServiceMock = {
  getById: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const fakeProduct = {
  id: 1,
  name: 'Clavier',
  description: 'Clavier mécanique',
  price: 49,
  quantity: 10,
  image: 'https://exemple.com/clavier.jpg',
};

describe('ProductUpdate', () => {
  let fixture: ComponentFixture<ProductUpdate>;
  let el: HTMLElement;
  let navigateSpy: MockInstance;

  // remplit un champ (input ou textarea) et notifie le FormControl
  const fillInput = (name: string, value: string) => {
    const field = el.querySelector<HTMLInputElement | HTMLTextAreaElement>(
      `[formControlName="${name}"]`
    )!;
    field.value = value;
    field.dispatchEvent(new Event('input'));
  };

  const submitForm = () => {
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    vi.clearAllMocks();   // nettoie les 3 spies d'un coup (isolation)
    productServiceMock.getById.mockReturnValue(of(fakeProduct));
    productServiceMock.update.mockReturnValue(of(fakeProduct));
    productServiceMock.delete.mockReturnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [ProductUpdate],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { params: { id: '1' } } } },
        { provide: ProductServices, useValue: productServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductUpdate);
    el = fixture.nativeElement;
    navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigateByUrl');
    fixture.detectChanges();   // ngOnInit → getById → patchValue → rendu
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  // test que l'id de la route est passé au service en number (le « + »)
  it('should fetch the product with the id from the route', () => {
    expect(productServiceMock.getById).toHaveBeenCalledWith(1);
  });

  // test l'état de chargement : NEVER = la réponse n'arrive jamais →
  // le @else « Chargement ... » est affiché et le formulaire absent
  it('should show loading state before the response', () => {
    productServiceMock.getById.mockReturnValue(NEVER);
    const pendingFixture = TestBed.createComponent(ProductUpdate);
    pendingFixture.detectChanges();
    const pendingEl: HTMLElement = pendingFixture.nativeElement;
    expect(pendingEl.textContent).toContain('Chargement');
    expect(pendingEl.querySelector('form')).toBeNull();
  });

  // test que le formulaire est pré-rempli avec les données du produit :
  // on lit les .value dans le DOM (toujours des strings côté DOM !)
  it('should prefill the form with the product data', () => {
    expect(el.querySelector<HTMLInputElement>('[formControlName="name"]')?.value).toBe('Clavier');
    expect(el.querySelector<HTMLTextAreaElement>('[formControlName="description"]')?.value).toBe('Clavier mécanique');
    expect(el.querySelector<HTMLInputElement>('[formControlName="price"]')?.value).toBe('49');
    expect(el.querySelector<HTMLInputElement>('[formControlName="quantity"]')?.value).toBe('10');
    expect(el.querySelector<HTMLInputElement>('[formControlName="image"]')?.value).toBe('https://exemple.com/clavier.jpg');
  });

  // test que la soumission envoie les valeurs MODIFIÉES et le bon id
  // (signature du service : update(valeurs, id) — l'ordre est vérifié aussi)
  it('should call update with edited values and the product id on submit', () => {
    fillInput('name', 'Clavier gamer');
    fixture.detectChanges();
    submitForm();
    expect(productServiceMock.update).toHaveBeenCalledWith(
      {
        name: 'Clavier gamer',            // ← la modification
        description: 'Clavier mécanique', // ← le reste vient du patchValue
        price: 49,
        quantity: 10,
        image: 'https://exemple.com/clavier.jpg',
      },
      1                                   // ← l'id en second argument
    );
  });

  // test la navigation vers la liste après un update réussi
  it('should navigate to /product on successful update', () => {
    submitForm();
    expect(navigateSpy).toHaveBeenCalledWith('/product');
  });

  // test qu'un échec de l'update n'entraîne pas de navigation
  it('should not navigate when update fails', () => {
    productServiceMock.update.mockReturnValue(throwError(() => new Error('500')));
    submitForm();
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  // test que delete est appelé avec l'id puis navigue vers la liste.
  // Sélecteur 'button[type="button"]' : cible le bouton delete SANS toucher
  // au bouton submit (le type="button" empêche aussi de soumettre le form)
  it('should call delete with the product id and navigate to /product', () => {
    el.querySelector<HTMLButtonElement>('button[type="button"]')!.click();
    fixture.detectChanges();
    expect(productServiceMock.delete).toHaveBeenCalledWith(1);
    expect(navigateSpy).toHaveBeenCalledWith('/product');
  });
});
