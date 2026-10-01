/**
 * ============================================================================
 * TESTS DU COMPOSANT « ProductAdd »
 * ============================================================================
 * Formulaire de création de produit : 5 champs validés, preview de l'image
 * saisie, appel de ProductServices.create() à la soumission puis navigation
 * vers la liste. En cas d'échec API : message d'erreur, pas de navigation.
 *
 * Ce qui est mocké : ProductServices → { create: vi.fn() } ; Router réel
 * espionné sur navigateByUrl.
 *
 * Détails techniques propres à ce spec :
 * - Le helper fillInput utilise le sélecteur [formControlName="..."] SANS
 *   préfixe de balise : la description est un <textarea>, pas un <input> —
 *   un sélecteur 'input[...]' l'aurait raté silencieusement.
 * - PIÈGE des inputs type="number" : Angular leur applique son
 *   NumberValueAccessor qui CONVERTIT la saisie en nombre dans le
 *   FormControl. On tape la string '49' dans le DOM, mais le service reçoit
 *   le number 49 → l'assertion attend bien 49 (pas '49').
 * - Les deux tests de preview d'image documentent un vrai bug corrigé :
 *   le @if doit tester la VALEUR du contrôle (get('image')?.value), pas le
 *   contrôle lui-même (toujours truthy). Tester les deux états (absente /
 *   présente) empêche le bug de revenir.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductAdd } from './product-add';
import { ProductServices } from '../../../shared/services/product/product-services';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi, type MockInstance } from 'vitest';

const productServiceMock = {
  create: vi.fn(),
};

describe('ProductAdd', () => {
  let fixture: ComponentFixture<ProductAdd>;
  let el: HTMLElement;
  let navigateSpy: MockInstance;

  const product = {
    name: 'Clavier',
      description: 'Clavier mécanique',
      price: 49,        // ← number, pas '49' ! (NumberValueAccessor)
      quantity: 10,     // ← number aussi
      image: 'https://exemple.com/clavier.jpg',
  }
  // remplit un champ (input OU textarea) et notifie le FormControl
  const fillInput = (name: string, value: string) => {
    const field = el.querySelector<HTMLInputElement | HTMLTextAreaElement>(
      `[formControlName="${name}"]`
    )!;
    field.value = value;
    field.dispatchEvent(new Event('input'));
  };

  // remplit tout le formulaire avec des valeurs qui passent les validators
  const fillValidForm = () => {
    fillInput('name', 'Clavier');
    fillInput('description', 'Clavier mécanique');
    fillInput('price', '49');
    fillInput('quantity', '10');
    fillInput('image', 'https://exemple.com/clavier.jpg');
    fixture.detectChanges();
  };

  const submitForm = () => {
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    // par défaut : une création qui réussit (json-server renverrait l'objet créé)
    productServiceMock.create.mockReturnValue(of({ id: 1 }));

    await TestBed.configureTestingModule({
      imports: [ProductAdd],
      providers: [provideRouter([]), { provide: ProductServices, useValue: productServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductAdd);
    el = fixture.nativeElement;
    navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigateByUrl');
    fixture.detectChanges();
    productServiceMock.create.mockClear();   // isolation entre tests
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });


  // test que la preview d'image est ABSENTE tant que le champ est vide
  // (pas de <img> du tout — donc pas d'icône d'image cassée)
  it('should not show image preview when image field is empty', () => {
    expect(el.querySelector('img')).toBeNull();
  });

  // test que la preview APPARAÎT quand une URL est saisie
  // (le duo absent/présent prouve la réactivité du @if, pas juste la présence)
  it('should show image preview when image field is filled', () => {
    fillInput('image', 'https://exemple.com/clavier.jpg');
    fixture.detectChanges();
    const img = el.querySelector('img');
    expect(img?.src).toBe('https://exemple.com/clavier.jpg');
  });

  // test que le service reçoit les valeurs saisies — avec les types convertis
  it('should call create with form values on submit', () => {
    fillValidForm();
    submitForm();
    expect(productServiceMock.create).toHaveBeenCalledWith(product);
  });

  // test la navigation vers la liste après création réussie
  it('should navigate to /product on successful create', () => {
    fillValidForm();
    submitForm();
    expect(navigateSpy).toHaveBeenCalledWith('/product');
  });

  // test qu'un formulaire invalide ne déclenche pas d'appel
  // (un seul champ rempli → les validators requis bloquent la soumission)
  it('should not call create when form is invalid', () => {
    fillInput('name', 'Clavier');   // formulaire partiellement rempli
    fixture.detectChanges();
    submitForm();
    expect(productServiceMock.create).not.toHaveBeenCalled();
  });

  // test le scénario d'échec API : pas de navigation + message affiché
  // (la chaîne doit être EXACTEMENT celle du signal errorMessage du composant)
  it('should show an error and not navigate when create fails', () => {
    productServiceMock.create.mockReturnValue(throwError(() => new Error('500')));
    fillValidForm();
    submitForm();
    expect(navigateSpy).not.toHaveBeenCalled();
    expect(el.textContent).toContain("L'ajout a échoué");
  });

  
});
