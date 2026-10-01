/**
 * ============================================================================
 * TESTS DU COMPOSANT « CalculatorTesting » — tests unitaires de méthodes pures
 * ============================================================================
 * Le cas le plus simple : des méthodes sans dépendance, sans template, sans
 * HTTP. Pas de mock, pas de provider — on appelle, on vérifie. C'est ici
 * qu'on illustre le pattern AAA (Arrange / Act / Assert) et le CHOIX DES
 * DONNÉES DE TEST :
 *
 * - valeurs ASYMÉTRIQUES (8 et 3, pas 5 et 5) : 5-5=0 passerait aussi avec
 *   un code bogué qui calcule b-a ! Les données doivent distinguer le
 *   comportement correct d'un comportement plausible mais faux ;
 * - le ZÉRO comme valeur VALIDE : régression du bug « falsy » (!b est vrai
 *   quand b vaut 0 → le zéro était traité comme un paramètre manquant) ;
 * - la NULLITÉ comme valeur INTERDITE : le garde « == null » doit lever une
 *   erreur (le « as any » force le cas que TypeScript interdit à la
 *   compilation — on teste la défense à l'EXÉCUTION) ;
 * - les DÉCIMAUX : 0.1 + 0.2 !== 0.3 en JavaScript (flottants IEEE 754) →
 *   toBeCloseTo au lieu de toBe ;
 * - pour tester un THROW : on passe une FONCTION à expect
 *   ( expect(() => ...) ) — sinon l'erreur explose avant que le matcher
 *   toThrow ne puisse l'attraper.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculatorTesting } from './calculator-testing';

describe('CalculatorTesting', () => {
  let component: CalculatorTesting;
  let fixture: ComponentFixture<CalculatorTesting>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalculatorTesting],
    }).compileComponents();

    fixture = TestBed.createComponent(CalculatorTesting);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // --------------------------------------------------------------------------
  // Les 4 opérations — cas nominal, avec le pattern AAA et des valeurs
  // asymétriques (l'ordre des opérandes est prouvé pour - et /)
  // --------------------------------------------------------------------------

  it('should return addition of two numbers', () => {
    // Arrange
    const a = 5;
    const b = 3;
    const resultExpected = 8;

    // Act
    const resultReel = component.addition(a, b);

    // Assert
    expect(resultReel).toBe(resultExpected);
  });

  it('should return soustraction of two numbers', () => {
    // Arrange — 8 et 3 : si le code calculait b - a, on obtiendrait -5 → détecté
    const a = 8;
    const b = 3;
    const resultExpected = 5;

    // Act
    const resultReel = component.soustraction(a, b);

    // Assert
    expect(resultReel).toBe(resultExpected);
  });

  it('should return multiplication of two numbers', () => {
    // Arrange
    const a = 5;
    const b = 3;
    const resultExpected = 15;

    // Act
    const resultReel = component.multiplication(a, b);

    // Assert
    expect(resultReel).toBe(resultExpected);
  });

  it('should return division of two numbers', () => {
    // Arrange — 6 et 3 : si le code calculait b / a, on obtiendrait 0.5 → détecté
    const a = 6;
    const b = 3;
    const resultExpected = 2;

    // Act
    const resultReel = component.division(a, b);

    // Assert
    expect(resultReel).toBe(resultExpected);
  });

  // la division peut donner un résultat non entier (pas de division entière en JS)
  it('should return a decimal result when the division is not exact', () => {
    expect(component.division(5, 2)).toBe(2.5);
  });

  // --------------------------------------------------------------------------
  // Le ZÉRO comme valeur VALIDE — tests de régression du bug « falsy » :
  // ces trois tests ÉCHOUAIENT avant le remplacement de !a/!b par == null
  // --------------------------------------------------------------------------

  it('should add with zero', () => {
    expect(component.addition(0, 5)).toBe(5);
  });

  it('should multiply by zero', () => {
    expect(component.multiplication(5, 0)).toBe(0);
  });

  it('should divide zero by a number', () => {
    expect(component.division(0, 5)).toBe(0);   // 0 au NUMÉRATEUR : légal
  });

  // --------------------------------------------------------------------------
  // Les valeurs INTERDITES → le composant doit lever une erreur.
  // Rappel : expect reçoit une FONCTION ( () => ... ) que le matcher toThrow
  // exécutera lui-même dans un try/catch.
  // --------------------------------------------------------------------------

  // le zéro au DÉNOMINATEUR : présent mais interdit → RangeError dédiée
  it('should throw an error when dividing by zero', () => {
    // Arrange
    const a = 5;
    const b = 0;

    // Act + Assert (fusionnés : c'est expect qui déclenche l'appel)
    expect(() => component.division(a, b)).toThrow('Division par zéro impossible.');
  });

  // paramètre ABSENT (null/undefined) → Error « requis », pour chaque méthode.
  // « as any » : on force à l'exécution un cas que TypeScript interdit.
  it('should throw when a parameter is missing', () => {
    expect(() => component.addition(undefined as any, 5)).toThrow('requis');
    expect(() => component.soustraction(5, null as any)).toThrow('requis');
    expect(() => component.multiplication(undefined as any, 5)).toThrow('requis');
    expect(() => component.division(null as any, 5)).toThrow('requis');
  });

  // --------------------------------------------------------------------------
  // Autres classes d'entrées
  // --------------------------------------------------------------------------

  it('should handle negative numbers', () => {
    expect(component.addition(-5, 3)).toBe(-2);
    expect(component.division(-6, 3)).toBe(-2);
  });

  // le piège des flottants : 0.1 + 0.2 === 0.30000000000000004 en JavaScript !
  // toBe(0.3) échouerait ; toBeCloseTo compare avec une tolérance.
  it('should add decimal numbers', () => {
    expect(component.addition(0.1, 0.2)).toBeCloseTo(0.3);
  });

  // --------------------------------------------------------------------------
  // BONUS : test paramétré avec it.each — même schéma, plusieurs jeux de
  // données, zéro duplication. Chaque ligne du tableau devient un test
  // distinct dans le rapport (%i est remplacé par les valeurs).
  // --------------------------------------------------------------------------

  it.each([
    [2, 3, 5],
    [0, 5, 5],
    [-5, 3, -2],
    [10, -4, 6],
  ])('addition(%i, %i) should return %i', (a, b, expected) => {
    expect(component.addition(a, b)).toBe(expected);
  });
  
});