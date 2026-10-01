import { Component } from '@angular/core';

@Component({
  selector: 'app-calculator-testing',
  imports: [],
  templateUrl: './calculator-testing.html',
  styleUrl: './calculator-testing.css',
})
export class CalculatorTesting {

  addition(a: number, b: number): number {
    // « == null » (double égal volontaire) attrape null ET undefined,
    // mais laisse passer 0 — qui est une valeur valide en arithmétique
    if (a == null || b == null) {
      throw new Error('Les deux paramètres sont requis.');
    }
    return a + b;
  }

  soustraction(a: number, b: number): number {
    if (a == null || b == null) {
      throw new Error('Les deux paramètres sont requis.');
    }
    return a - b;
  }

  multiplication(a: number, b: number): number {
    if (a == null || b == null) {
      throw new Error('Les deux paramètres sont requis.');
    }
    return a * b;
  }

  division(a: number, b: number): number {
    if (a == null || b == null) {
      throw new Error('Les deux paramètres sont requis.');
    }
    // cas distinct : paramètre présent mais INTERDIT → erreur différente
    if (b === 0) {
      throw new RangeError('Division par zéro impossible.');
    }
    return a / b;
  }

}