# Théorie du testing avec Vitest

> Support de cours du projet **angular-vitest** — basé sur la documentation
> officielle de Vitest : <https://vitest.dev/guide/learn/writing-tests.html>

---

## 1. Introduction théorique au testing

### 1.1 Pourquoi tester ?

Un test automatisé est un programme qui vérifie qu'un autre programme fait ce
qu'on attend de lui. Ses bénéfices :

- **Détecter les régressions** : une modification qui casse un comportement
  existant est signalée immédiatement, pas découverte en production ;
- **Documenter le code** : un test bien nommé décrit le comportement attendu
  (`should block and redirect when not logged` se lit comme une spécification) ;
- **Permettre le refactoring** : on peut réorganiser le code en confiance,
  la suite de tests confirme que le comportement n'a pas changé ;
- **Concevoir mieux** : un code difficile à tester est souvent un code mal
  découpé — le test agit comme un révélateur d'architecture.

### 1.2 Les types de tests (la pyramide)

```
        /  E2E  \        peu nombreux, lents, fragiles
       / Intégra- \
      /   tion     \     quelques-uns, moyens
     /  Unitaires   \    nombreux, rapides, précis
    /________________\
```

| Type | Ce qu'on teste | Dépendances | Exemple dans ce projet |
|---|---|---|---|
| **Unitaire** | Une unité isolée (méthode, composant, guard) | **Mockées** | `calculator-testing.spec.ts`, `auth-guard.spec.ts`, les specs de composants |
| **Intégration** | Plusieurs briques qui collaborent réellement | Partiellement réelles | `auth-services.spec.ts` (vrai service + vrai HttpClient, seul le réseau est simulé) |
| **End-to-End (E2E)** | L'application complète dans un vrai navigateur | Réelles | non couvert ici (outils : Playwright, Cypress) |

La frontière unitaire/intégration est débattue en front-end. Convention de ce
projet : composant avec services mockés = **unitaire** ; service testé avec la
vraie mécanique `HttpClient` = **intégration**.

### 1.3 Le pattern AAA (Arrange – Act – Assert)

Chaque test suit trois temps :

```typescript
it('should return addition of two numbers', () => {
  // Arrange : préparer les données et l'état de départ
  const a = 5;
  const b = 3;

  // Act : exécuter LA chose qu'on teste
  const result = component.addition(a, b);

  // Assert : vérifier le résultat observable
  expect(result).toBe(8);
});
```

Règles associées :

- **Un test = un comportement.** Plusieurs `expect` sont acceptables s'ils
  vérifient les facettes d'un même comportement ;
- **L'Arrange précède toujours l'Act** — piloter un mock *après* avoir exécuté
  le code testé est un bug de test classique ;
- Cas particulier : pour tester une exception, Act et Assert fusionnent
  (`expect(() => ...).toThrow(...)` — c'est le matcher qui exécute la fonction).

### 1.4 Le vocabulaire des doublures (mocks, spies, stubs)

| Terme | Définition | Dans ce projet |
|---|---|---|
| **Mock** | Objet factice qui **remplace** une dépendance | `authServiceMock` fourni via `{ provide: AuthServices, useValue: ... }` |
| **Spy** | Enveloppe qui **observe** une vraie méthode (elle s'exécute toujours) | `vi.spyOn(router, 'navigateByUrl')` |
| **Stub** | Fonction factice qui renvoie une valeur programmée | `vi.fn().mockReturnValue(of(fakeProduct))` |

Règle d'or : **on mocke les dépendances de la chose testée, jamais la chose
testée.** Composant testé → services et route mockés. Service testé → backend
HTTP mocké. Guard testé → AuthService mocké.

### 1.5 Les qualités d'un bon test

- **Isolé** : aucun test ne dépend d'un autre — d'où les resets dans
  `beforeEach` (signaux, `mockClear`, `localStorage.clear()`) ;
- **Déterministe** : même résultat à chaque exécution ;
- **Rapide** : une suite lente ne sera plus lancée ;
- **Discriminant** : les données de test doivent distinguer le code correct
  d'un code plausible mais faux (tester `soustraction(8, 3)` et non `(5, 5)`,
  car `5 - 5 = 0` passerait aussi avec un code qui calcule `b - a`) ;
- **Les deux états** : un affichage conditionnel se teste affiché **et**
  masqué — sinon un élément rendu en permanence passe le test « visible ».

---

## 2. Vitest : présentation

**Vitest** est le runner de tests de l'écosystème Vite. C'est le runner par
défaut des projets Angular depuis la v20/21 (il remplace Karma, déprécié).

Caractéristiques :

- **Basé sur Vite** : TypeScript fonctionne sans configuration ni étape de
  build. ⚠️ Nuance de la doc : Vitest *transpile* le TypeScript mais ne fait
  **pas de vérification de types** pendant les tests — le type-checking reste
  le travail du compilateur (`tsc` / le build Angular) ;
- **API compatible Jest** : `describe`, `it`, `expect`, les matchers — les
  connaissances sont transférables dans les deux sens ;
- **Exécution** : les **fichiers** de test tournent en parallèle et isolés les
  uns des autres ; **dans** un fichier, les tests s'exécutent séquentiellement
  (sauf `test.concurrent`) ;
- Dans ce projet, les tests tournent dans **jsdom** (un DOM simulé en Node,
  cf. la devDependency `jsdom`) : pas de navigateur ouvert, contrairement à
  Karma. Lancement : `ng test` (mode watch) ou `ng test --watch=false`.

### 2.1 Découverte des fichiers de test

Vitest trouve automatiquement les fichiers correspondant aux motifs
`**/*.test.*` / `**/*.spec.*`. La doc valide les deux stratégies
d'organisation : tests **co-localisés** avec le code source (le choix
d'Angular : `login.ts` + `login.spec.ts` côte à côte) ou dossier de tests
dédié.

---

## 3. L'implémentation selon la documentation

### 3.1 Le premier test : `test` / `it` + `expect`

```typescript
import { expect, test } from 'vitest';

test('1 + 1 equals 2', () => {
  expect(1 + 1).toBe(2);
});
```

`test` et `it` sont des **alias interchangeables** — la doc laisse le choix
selon la lisibilité. Convention Angular (héritée de Jasmine) : `it`, dont le
nom complète une phrase : *it should create*, *it should navigate...*

### 3.2 Organiser avec `describe`

```typescript
describe('CalculatorTesting', () => {
  it('should add two numbers', () => { ... });
  it('should throw when dividing by zero', () => { ... });
});
```

`describe` groupe les tests en suites (et peut s'imbriquer). Conseil de la
doc : **garder l'imbrication peu profonde** — une liste plate suffit pour un
module simple. Dans ce projet : un `describe` par composant/service, liste
plate de `it` à l'intérieur.

### 3.3 Les assertions : `expect` et les matchers

Les matchers utilisés dans ce projet :

| Matcher | Vérifie | Exemple |
|---|---|---|
| `toBe(x)` | égalité stricte (`===`) — primitives et références | `expect(result).toBe(8)` |
| `toEqual(obj)` | égalité **structurelle** (contenu des objets) | `expect(req.request.body).toEqual(credentials)` |
| `toBeTruthy()` / `toBeFalsy()` | véracité / fausseté | `expect(component).toBeTruthy()` |
| `toBeNull()` | valeur `null` (plus précis que `toBeFalsy`) | `expect(el.querySelector('img')).toBeNull()` |
| `toContain(x)` | présence dans une chaîne ou un tableau | `expect(el.textContent).toContain('49€')` |
| `toThrow(msg)` | l'exception levée (⚠️ passer une **fonction** à expect) | `expect(() => division(5, 0)).toThrow('zéro')` |
| `toBeCloseTo(x)` | égalité approchée pour les **flottants** | `expect(addition(0.1, 0.2)).toBeCloseTo(0.3)` (car `0.1 + 0.2 === 0.30000000000000004` !) |
| `toHaveBeenCalled()` | le spy a été appelé | `expect(logoutSpy).toHaveBeenCalled()` |
| `toHaveBeenCalledWith(...)` | ... avec ces arguments précis | `expect(navigateSpy).toHaveBeenCalledWith('/product')` |
| `.not.` | négation de n'importe quel matcher | `expect(spy).not.toHaveBeenCalled()` |

### 3.4 Les hooks de cycle de vie

```typescript
beforeEach(() => { ... });   // avant CHAQUE test  → préparer un état frais
afterEach(() => { ... });    // après chaque test  → nettoyer / vérifier
beforeAll(() => { ... });    // une seule fois avant la suite
afterAll(() => { ... });     // une seule fois après la suite
```

Usage dans ce projet :

- `beforeEach` : configuration du `TestBed`, création de la fixture, **reset
  des mocks** (`mockClear`, `vi.clearAllMocks`, `signal.set(false)`) — c'est
  lui qui garantit l'isolation ;
- `afterEach` : `httpMock.verify()` dans les specs de services — échoue si
  une requête est restée sans réponse ou est partie sans être attendue.

On utilise `beforeEach` (et non `beforeAll`) pour la création des instances :
chaque test reçoit un composant **neuf**, aucun état ne fuite.

### 3.5 Les modificateurs de test

| Modificateur | Effet | Usage |
|---|---|---|
| `it.only(...)` | n'exécute **que** ce test | débogage ciblé (⚠️ à ne pas commiter !) |
| `it.skip(...)` | ignore ce test | désactiver temporairement sans supprimer |
| `it.todo('...')` | marque un test **à écrire** | planifier la couverture |

### 3.6 Les tests paramétrés : `test.for` / `it.each`

Pour répéter la même logique sur plusieurs jeux de données :

```typescript
it.each([
  [2, 3, 5],
  [0, 5, 5],
  [-5, 3, -2],
])('addition(%i, %i) should return %i', (a, b, expected) => {
  expect(component.addition(a, b)).toBe(expected);
});
```

Chaque ligne devient un test distinct dans le rapport ; `%i` / `%s` / `%f`
sont interpolés dans le nom. La doc recommande la forme moderne `test.for`
(qui accepte aussi des objets avec la syntaxe `$propriété`) ; `test.each`
est l'API historique compatible Jest — c'est celle utilisée dans
`calculator-testing.spec.ts`.

### 3.7 Les doublures avec `vi`

L'objet `vi` est la boîte à outils de mock de Vitest (équivalent de
`jasmine.createSpy` / `jest.fn`) :

```typescript
import { vi } from 'vitest';

// un stub : fonction factice qui renvoie une valeur programmée
const getById = vi.fn().mockReturnValue(of(fakeProduct));

// un spy : observe une VRAIE méthode (qui continue de s'exécuter)
const navigateSpy = vi.spyOn(router, 'navigateByUrl');

// reprogrammer pour un test précis (ex : simuler une erreur)
getById.mockReturnValue(throwError(() => new Error('500')));

// nettoyer entre les tests (dans beforeEach)
getById.mockClear();      // remet le compteur d'appels à zéro
vi.clearAllMocks();       // idem pour TOUS les mocks d'un coup
```

Le type d'un spy est `MockInstance` (importable avec
`import { vi, type MockInstance } from 'vitest'`).

### 3.8 Lire la sortie de Vitest

- Les résultats s'affichent en **arborescence** (fichier → describe → it),
  verte ou rouge ;
- Un échec affiche le **diff** attendu/reçu (`Expected` / `Received`) et la
  **ligne** exacte de l'assertion ;
- 🔍 Réflexe de débogage : quand plusieurs tests d'un même fichier tombent
  d'un coup, suspecter le `beforeEach` (une erreur là-dedans fauche tous les
  `it` qui suivent) ; la ligne `❯ src/app/...` au-dessus de la stack indique
  **quel fichier** échoue — toujours la lire avant de chercher ;
- `globals: true` dans la config permet d'omettre les imports de `describe` /
  `it` / `expect` (comportement à la Jest).

---

## 4. La correspondance théorie ↔ projet

| Concept | Où le voir en pratique |
|---|---|
| AAA et méthodes pures | `calculator-testing.spec.ts` |
| TestBed, fixture, `detectChanges` | `app.spec.ts` (le plus simple) |
| Mock d'un service + signal piloté | `navbar.spec.ts` |
| Formulaires : saisie simulée, soumission, validation | `login.spec.ts`, `register.spec.ts` |
| Spy sur le Router (`navigateByUrl` / `navigate`) | `login.spec.ts`, `product-list.spec.ts` |
| Mock d'`ActivatedRoute` (params d'URL) | `product-details.spec.ts`, `product-update.spec.ts` |
| État de chargement (`NEVER`) et état vide | `product-update.spec.ts`, `product-list.spec.ts` |
| Guard + `runInInjectionContext` | `auth-guard.spec.ts` |
| Backend HTTP mocké (`HttpTestingController`) | `auth-services.spec.ts`, `product-services.spec.ts` |
| `toThrow`, `toBeCloseTo`, `it.each` | `calculator-testing.spec.ts` |

## 5. Commandes utiles

```bash
ng test                  # lance la suite en mode watch (relance à chaque sauvegarde)
ng test --watch=false    # une seule exécution (utile en CI)
ng test --coverage       # génère le rapport de couverture HTML dans coverage/
```
