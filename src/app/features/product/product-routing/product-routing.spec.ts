/**
 * ============================================================================
 * TESTS DU COMPOSANT « ProductRouting »
 * ============================================================================
 * Composant LAYOUT de la section product : son template ne contient que le
 * sous-menu (liens List / Add) et le <router-outlet> où s'affichent les
 * sous-pages (list, add, details, update). Aucune logique → 3 tests de
 * structure, même calibre que App.
 *
 * Seul provider nécessaire : provideRouter([]) — le template utilise
 * RouterLink et RouterOutlet, qui injectent des services du router.
 * Sans lui : erreur NG0201 « No provider found for ActivatedRoute » dans le
 * beforeEach, et TOUS les tests du fichier tombent d'un coup (symptôme à
 * reconnaître : plusieurs échecs simultanés = souvent le beforeEach).
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ProductRouting } from './product-routing';

describe('ProductRouting', () => {
  let component: ProductRouting;
  let fixture: ComponentFixture<ProductRouting>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductRouting],
      providers: [provideRouter([])],   // ← RouterLink et RouterOutlet en ont besoin
    }).compileComponents();

    fixture = TestBed.createComponent(ProductRouting);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  // test « smoke » : le composant et son template compilent sans erreur
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // le layout doit fournir l'outlet où les sous-pages s'affichent
  it('should have a router outlet for child routes', () => {
    expect(el.querySelector('router-outlet')).toBeTruthy();
  });

  // les liens de navigation du sous-menu : on vérifie leur DESTINATION
  // (attribut routerLink), pas leur texte — c'est la destination qui compte
  it('should have links to list and add', () => {
    const links = Array.from(el.querySelectorAll('a')).map(a => a.getAttribute('routerLink'));
    expect(links).toContain('/product');
    expect(links).toContain('/product/add');
  });
});
