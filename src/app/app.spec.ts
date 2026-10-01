/**
 * ============================================================================
 * TESTS DU COMPOSANT RACINE « App »
 * ============================================================================
 * App est le composant « coquille » (shell) de l'application : son template
 * ne contient que la navbar et le <router-outlet> dans lequel le router
 * affiche les pages. Il n'a AUCUNE logique propre → on se limite donc à
 * 3 tests de structure. Règle d'or : on calibre l'effort de test sur la
 * logique du composant, pas sur sa taille.
 *
 * Outils utilisés :
 * - TestBed          : l'environnement de test d'Angular. Il joue le rôle du
 *                      contexte d'injection de l'application : on lui déclare
 *                      ce qu'on importe (le composant standalone) et ce qu'on
 *                      fournit (providers).
 * - ComponentFixture : l'enveloppe du composant créé pour le test. Donne accès
 *                      à l'instance TypeScript (componentInstance) et au DOM
 *                      rendu (nativeElement), et permet de déclencher le rendu
 *                      avec detectChanges().
 * - provideRouter([]) : fournit un VRAI router avec zéro route. Indispensable
 *                      car le template contient <router-outlet> et la navbar
 *                      contient des routerLink : ces directives injectent
 *                      ActivatedRoute → sans ce provider, erreur NG0201
 *                      « No provider found for ActivatedRoute ».
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from './app';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';

describe('App', () => {
  // Variables partagées par tous les tests : déclarées ici, assignées dans le
  // beforeEach. Chaque test reçoit ainsi une instance FRAÎCHE (isolation).
  let fixture : ComponentFixture<App>;
  let app : App;
  let el : HTMLElement;

  beforeEach(async () => { // ré-exécuté avant CHAQUE test → aucun état partagé
    await TestBed.configureTestingModule({
      imports: [App,Navbar],                    // le composant standalone à tester
      providers : [provideRouter([])]    // le router (exigé par routerLink / router-outlet)
    }).compileComponents();

    // Création du composant : fixture = enveloppe de test, app = instance TS
    fixture = TestBed.createComponent(App);
    app = fixture.componentInstance;
    el = fixture.nativeElement;
    // Déclenche le premier rendu du template (en test, c'est NOUS qui pilotons
    // la détection de changement, elle n'est pas automatique)
    fixture.detectChanges();

  });

  // Test « smoke » : le composant se construit et son template compile sans
  // erreur. C'est lui qui échoue si une dépendance du template manque.
  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  // Test de structure : la balise <app-navbar> est bien rendue.
  // On vérifie sa PRÉSENCE seulement — son contenu est testé dans navbar.spec
  // (chaque spec teste SA responsabilité, pas celle des voisins).
  it('should render the navbar', () => {

    expect(el.querySelector('app-navbar')).toBeTruthy();
  });

  // Test de structure : le <router-outlet> est présent — sans lui, aucune
  // page ne pourrait s'afficher.
  it('should have a router outlet', () => {
    expect(fixture.nativeElement.querySelector('router-outlet')).toBeTruthy();
  });
});
