# Les tests avec Vitest

### Configuration et commandes

- Pour obtenir des informations sur ce que vitest propose
```bash
ng test --help
```

- Pour lancer les tests dans le terminal directemment ( pratique pour avoir un resultat rapide )
```bash
ng test
```

- Lancer les tests avec l'interface (doit être installé avant)
```bash
ng test --ui
```

---

### Comment fonctionne les tests

#### On retrouve quelques étapes importantes pour l'implémentation des tests

- Arrange : Configuration et mock ( définir ce dont on a besoin pour executer les tests : valeur pour les paramètres , mock , etc ...)

- Act : Execution du test ( on fournit une valeur si nécéssaire et on execute ce que l'on veut tester )

- Assert : Verification si le resultat attendu correspond bien à ce qui est attenduµ


---

# Fichier spac.ts

- Les tests seront implémenter dans les fichiers spec.ts

