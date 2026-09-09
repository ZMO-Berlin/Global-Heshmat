# Implantation des recommandations — 8 septembre 2026

Ce document complète l’audit initial, qui décrit l’état avant modification.

## Fonctionnalités livrées dans le code

- Galerie : compteurs et aperçus d’albums, photographies non recadrées, modes Notices, Photos regroupées et Liste.
- Albums : toutes les miniatures, légendes, plein écran au clavier, liens vers une photographie stable, retour au contexte de consultation.
- Dossier « œuvres à retrouver » : 13 notices, documentation existante, lieux enregistrés explicitement non confirmés et courriel de contribution prérempli. Aucun message n’est envoyé automatiquement.
- Filtres partagés : pays, statut, type de notice et recherche dans les titres, descriptions et résidences. Conservation dans les URL et l’historique.
- Notices statiques : descriptions et photographies présentes dans le HTML, liens canoniques inchangés, image sociale propre à la notice et suppression de la fausse localisation de création.
- Carte : quatre sources filtrées ensemble (œuvres, résidences, anciens lieux et déplacements), chargement différé, erreur récupérable et accès à la galerie.
- Médias : manifeste de dimensions et poids pour 149 images, descripteurs responsive exacts, gestion visible des erreurs. Génération incrémentale par empreinte du contenu et de l’encodeur, protection contre les collisions et écritures temporaires.
- Données : slugs existants figés ; champs facultatifs pour provenance, précision géographique, titre d’affichage, couverture et métadonnées des documents.
- Hors ligne : notices déjà visitées mises en cache ; page explicite lorsqu’une notice n’a pas encore été téléchargée.

## Contrôles automatisés

La CI vérifie formatage, lint, types, tests unitaires, build statique et ses assertions, parcours Chromium/WebKit et budgets Lighthouse. Les mesures utilisent des profils de navigateur indépendants : trois passages par cas, médiane des scores et métriques, conservation des rapports HTML/JSON pendant 14 jours.

Budgets : performance ≥ 90 sur ordinateur / ≥ 85 sur mobile lent simulé ; accessibilité 100 ; bonnes pratiques ≥ 95 ; SEO 100 ; LCP ≤ 2,5 s sur ordinateur / 4 s sur mobile simulé ; CLS ≤ 0,1 ; JavaScript transféré ≤ 350 Kio ; aucun téléchargement de la carte sur les pages galerie, album ou dossier.

Le scénario d’émulation hors ligne s’exécute sous Chromium : cette prise en charge de Playwright est [documentée ici](https://playwright.dev/docs/service-workers). Cela ne constitue pas une validation sur un appareil Safari réel.

## Travail éditorial et suites reportées

Les nouvelles métadonnées restent facultatives : leur renseignement demande des sources vérifiées. Aucun crédit, lieu actuel ou événement historique n’a été inventé. Chronologie, réseau, comparaisons et parcours éditoriaux restent reportés selon la demande. Les originaux et l’historique Git LFS ne sont pas réécrits.

Les changements sont locaux ; les actions GitHub s’exécuteront après publication du code dans le dépôt.

## Optimisation mobile mesurée

Ajout de 149 dérivés intermédiaires de 800 pixels maximum (environ 6,4 Mio au total, téléchargés à la demande). Ils ont été produits à partir des dérivés pleine définition déjà conservés ; le générateur normal les produira ensuite avec les autres tailles. Deux dérivés du billet de musée, conservés à tort à leur taille originale, ont été corrigés. Le manifeste refuse désormais les variantes dépassant leur dimension maximale. La grille réserve une disposition stable sur mobile pendant le chargement des polices.

Les seuils mobiles sont des budgets de régression en laboratoire, calibrés sur le profil lent de Lighthouse. Ils ne constituent pas une validation des Core Web Vitals sur le terrain. L’objectif d’optimisation reste 90/100 sur mobile et un LCP terrain inférieur à 2,5 secondes.

## Résultats de validation locale

- Formatage, ESLint et svelte-check : réussis, aucune erreur ni avertissement de typage.
- Vitest : 150 tests réussis.
- Vérification des artefacts : 378 assertions réussies ; manifeste de 149 images et quatre variantes validé.
- Playwright : 27 tests réussis sur Chromium et WebKit ; un scénario hors ligne réservé à Chromium.
- Impeccable : aucune anomalie statique signalée. Contrôle visuel groupé sur ordinateur et téléphone.
- Les neuf originaux suivis par Git LFS correspondent à leurs empreintes SHA-256 enregistrées ; aucun original modifié.

Médianes de trois mesures Lighthouse par profil :

| Profil                  | Performance | Accessibilité | Bonnes pratiques | SEO |    LCP |
| ----------------------- | ----------: | ------------: | ---------------: | --: | -----: |
| Galerie — ordinateur    |          99 |           100 |              100 | 100 | 0.84 s |
| Galerie — mobile simulé |          86 |           100 |              100 | 100 | 3.11 s |
| Album — mobile simulé   |          88 |           100 |              100 | 100 | 3.53 s |
| Dossier — mobile simulé |          90 |           100 |              100 | 100 | 3.18 s |

Tous les budgets de régression configurés passent localement. Les exécutions GitHub Actions et le déploiement ne sont pas encore réalisés.
