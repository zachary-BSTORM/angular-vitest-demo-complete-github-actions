/**
 * ============================================================================
 * TESTS DU COMPOSANT « Homepage »
 * ============================================================================
 * Page STATIQUE : aucune logique, uniquement du contenu (titre, listes,
 * tableau récapitulatif des tests). Volontairement, on écrit donc très peu
 * de tests — c'est un choix assumé, pas un oubli :
 *
 * - Tester chaque phrase du contenu coûterait cher en maintenance (le test
 *   casse à chaque reformulation) et n'attraperait aucun vrai bug.
 * - On préfère tester la STRUCTURE (un titre, 5 lignes de tableau) plutôt
 *   que la PROSE : ces tests documentent la page et n'échouent que si on
 *   la modifie volontairement.
 *
 * À noter : pas de providers ici — le template n'utilise ni routerLink,
 * ni service, donc le TestBed n'a rien à fournir.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Homepage } from './homepage';

describe('Homepage', () => {
  let component: Homepage;
  let fixture: ComponentFixture<Homepage>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Homepage],
    }).compileComponents();

    fixture = TestBed.createComponent(Homepage);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  // test la création du composant — pour une page statique c'est LE test
  // utile : il attrape toute erreur de template (balise mal fermée, etc.)
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // test que le titre de la page est affiché dans un heading.
  // On cible le <h2> précis (querySelector) plutôt que el.textContent global :
  // on vérifie que le titre est UN TITRE, pas juste une chaîne quelque part.
  it('should display the page title', () => {
    expect(el.querySelector('h2')?.textContent).toContain('Demo Angular avec Vitest');
  });

  // test de STRUCTURE : le tableau présente bien les 5 cibles de test.
  // Si on ajoute une ligne (ex : interceptor), ce test échoue → on le met à
  // jour consciemment. Il documente sans recopier le contenu.
  it('should list the 5 test targets in the table', () => {
    expect(el.querySelectorAll('tbody tr').length).toBe(5);
  });
});
