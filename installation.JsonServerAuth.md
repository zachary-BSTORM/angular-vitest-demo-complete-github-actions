# Installation de Json-Server-Auth

### Commande pour l'installation :

- Installation de json-sever et json-server-auth pour gérer les requettes et l'authentification (hashage du mot de passe et création d'un token pour l'authentification)


```bash
npm i -D json-server@0.17.4 json-server-auth express@4
```

### Création du fichier db.json qui va simuler la base de données :

- à la racine ajouter un fichier db.json avec la structure correspondante : 

```json
{
    "users" : [],
    "product": []
}
```

### Ajouter le script qui permet de lancer le server : 

```json
"api": "json-server-auth db.json"
```

### Commande pour lancer le serveur ( le serveur doit être en execution dans un terminal pendant qu'on l'utilise)

```bash
npm run api
```

### Si tout c'est bien passé vous devriez avoir ceci dans le terminal : 

```
 \{^_^}/ hi!

  Loading db.json
  Loading C:\.....
  Done

  Resources
  http://localhost:3000/users
  http://localhost:3000/product
```