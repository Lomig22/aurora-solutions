---
name: aurora-seo
description: Règles éditoriales et contrôles obligatoires du site Aurora Solutions (électricien à Pons, 17). À charger AVANT toute modification de contenu, création de page, écriture de FAQ, balisage JSON-LD, rédaction de title/description, ou publication de zip. Contient les interdits du client, les données NAP de référence, la méthode de mesure de duplication et un script de vérification exécutable. Se déclenche sur : nouvelle page, page ville, page service, FAQ, schema, sitemap, llms.txt, avis clients, meta description, réécriture de contenu.
---

# Aurora Solutions — règles du site et contrôles avant livraison

Site vitrine statique d'un électricien. 26 pages HTML, CSS dupliqué en ligne dans
chaque fichier, **aucun build, aucun include partagé** : une modification de pied de
page se répercute fichier par fichier. Hébergement **Vercel** (`vercel.json` porte les
redirections ; `CNAME` et `.nojekyll` sont des reliquats inertes).

Le client s'appelle Thomas. Il a vécu une chute de visibilité en septembre 2026 et
redoute la désindexation. **Toute production qui « ressemble à de l'IA » est un
échec**, quelles que soient ses qualités par ailleurs.

## 1. Interdits absolus

Ces règles viennent du client. Ne jamais les contourner, même si le contexte semble
s'y prêter.

| Interdit | Détail |
|---|---|
| **Aucun tarif** | Ni prix, ni fourchette, ni « à partir de ». Le devis est gratuit et établi après visite, jamais par téléphone. |
| **Aucune adresse** | Le siège est le domicile de Thomas. Elle ne figure que dans `mentions-legales.html`, où la loi l'impose. Nulle part ailleurs. |
| **Aucun partenariat de marque** | Schneider, Legrand, Wallbox : interdits. Thermor (clim) et Hager (appareillage) sont cités comme matériel **utilisé**, sans lien commercial. |
| **Pas de RGE, pas d'aides** | Aucune qualification RGE, aucune subvention, aucun crédit d'impôt, aucun dossier de financement. La seule mention autorisée est la négation, sur `about.html` et `climatisation.html`. |
| **Pas de diagnostic immobilier** | Ni DPE, ni diagnostic type vente. |
| **Pas de CONSUEL** dans les pages rénovation | Le terme existe ailleurs sur le site ; ne pas l'introduire dans un contexte de rénovation. |
| **Pas d'autorisation administrative** | Ne pas évoquer de démarche en mairie, d'ABF ni de déclaration préalable. |
| **Voix « nous »** | Jamais « je », même si Thomas travaille seul. Décision assumée. |
| **Pas de superlatif** | Jamais « le meilleur électricien ». Allégation invérifiable, juridiquement exposée. |
| **Pas de chiffre d'économie promis** | On peut expliquer un rendement (SCOP 3,5–4,5), jamais promettre un pourcentage sur facture. |

**Répétition = danger.** Le client l'a dit explicitement : *« ne répète pas les mêmes
choses sur les pages… Sinon on va voir que c'est fait par IA et que ce sont des copies.
Mon site deviendrait désindexé. »*

## 2. Données de référence (NAP)

Source unique. Ne jamais en dévier, ne jamais réécrire de mémoire.

```
Nom          Aurora Solutions          (jamais "Aurora Solutions Électricité")
Téléphone    07 63 09 48 24            (+33763094824)
E-mail       aurora.solutions.17800@gmail.com
Site         https://www.aurora-solutions-electricite.fr
Ville        Pons, 17800, Charente-Maritime
SIRET        945 006 609 000 16
Fondateur    Thomas
Communes     Pons, Gémozac, Jonzac, Saintes, Saujon, Royan, Cognac, Île d'Oléron
```

⚠️ `mentions-legales.html` contient un **second SIRET**, `944 989 599 000 13` : c'est
celui de Payment Flow, le prestataire qui a réalisé le site. Ne jamais le reprendre.

**Titres détenus** : Bac Pro Électricité, BTS Électrotechnique, qualification IRVE,
garantie décennale, RC Pro, et une **formation** (pas une qualification, pas un
agrément) au dimensionnement des climatisations réversibles suivie **chez Thermor, du
groupe Atlantic**. Maintenir cette distinction formation/qualification partout.

## 3. Contrôles obligatoires avant toute livraison

Lancer le script. Il est la référence, pas votre lecture du diff.

```bash
python3 .claude/skills/aurora-seo/scripts/verifier.py
```

Il échoue (code 1) sur :

- **JSON-LD invalide** sur une page — déjà arrivé : un lien inséré dans une chaîne
  `description` a rendu le bloc impossible à parser.
- **FAQ balisée ≠ texte visible** — Google exige une correspondance exacte. Déjà
  arrivé avec des espaces insécables invisibles à la lecture.
- **Question FAQ dupliquée** entre deux pages — déjà arrivé : une question écrite pour
  `services.html` existait sur `about.html`.
- **Duplication éditoriale > 3 %** entre deux pages.
- **title hors 50–60** ou **description hors 120–160** caractères.
- **Page absente du sitemap** ou sans lien entrant.

Il avertit (sans échouer) sur les termes sensibles : marques interdites, motifs de
prix, adresse hors mentions légales. Ces alertes demandent un œil humain — la page
`about.html` dit légitimement « nous ne sommes pas qualifiés RGE ».

## 4. Mesurer la duplication — la bonne méthode

**Ne comparez jamais les fichiers entiers.** Les 22 avis clients, le formulaire, la
navigation et le pied de page sont partagés par construction : les inclure produit un
faux positif massif. Cette erreur a déjà été commise — 60 % annoncés, 0 à 5 % réels.

La zone éditoriale va de `<!-- PAGE HERO -->` jusqu'au premier de
`<!-- AVIS CLIENTS -->`, `<!-- ZONES -->`, `<!-- AUTRES ZONES -->` ou `<!-- CTA -->`.
On y compare les **ensembles de phrases de plus de 55 caractères**.

Référence actuelle : **0 paire problématique sur 190**, duplication maximale **1,6 %**
entre `electricien-cognac.html` et `electricien-gemozac.html`.

## 5. Créer une page — checklist complète

Aucune étape n'est optionnelle. Une page sans lien entrant n'est jamais découverte.

1. **Partir d'une page existante comme gabarit** (`electricien-saintes.html` pour une
   ville, `borne-de-recharge-irve.html` pour un service) et remplacer la zone
   éditoriale entière. Le `<style>` et le pied de page se recopient tels quels.
2. **Vérifier d'abord ce que disent les pages voisines** pour ne pas les répéter.
3. `<title>` 50–60 caractères, `<meta description>` 120–160, uniques sur le site.
4. Synchroniser `og:title`, `og:description`, `twitter:title`, `twitter:description`.
5. JSON-LD : nœuds `WebPage` (avec `dateModified`), `BreadcrumbList`, `Service` ou
   équivalent, et `FAQPage` **strictement identique** au texte visible.
6. Ajouter l'URL à `sitemap.xml`.
7. Ajouter une entrée descriptive à `llms.txt`.
8. **Créer au moins deux liens entrants** depuis des pages thématiquement proches.
9. Lancer le script de vérification.
10. Contrôler le rendu en 1280 px **et** 390 px : aucun débordement horizontal.

### Pages service × ville — la règle qui protège le site

Une page combinant un service et une ville **uniquement là où un chantier réel et
documenté existe**. Sans ce socle, la page devient une page satellite (« doorway
page »), motif que Google sanctionne explicitement.

Cela plafonne l'ensemble à trois ou quatre pages, pas à plusieurs dizaines. Un plan
proposant « deux pages villes par mois » est à refuser : le client n'a pas la matière,
et il finirait par produire des variations.

## 6. Pièges connus de ce dépôt

- **Deux composants d'avis coexistent.** `index.html` utilise `.testi` / `.testi-name`
  / `.testi-body` ; les 18 autres pages utilisent `.pv-card` / `.pv-who` / `.pv-ini`.
  Une modification d'avis doit traiter les deux. Total actuel : 22 cartes, 19 Google et
  3 PagesJaunes.
- **Le CSS n'est pas partagé.** Une page qui n'a jamais eu de FAQ n'a pas les règles
  `.faq-list` / `.faq-item` : les blocs s'affichent sans cadre. Copier le bloc CSS
  depuis une page qui en a une.
- **Les envois de fichiers manquent les tirets.** Livrer en **zip**, jamais en fichiers
  séparés : des uploads ont déjà produit `electricienroyan.html` et un 404.
- **Le push GitHub est refusé (403)** depuis cet environnement. Livrer par zip et
  vérifier ensuite avec `git fetch origin main` puis
  `git diff --name-status origin/main HEAD`.
- **`realisations.html`** est bâtie sur des carrousels : ses titres en question
  introduisent des sections, pas des réponses autonomes. N'y forcez pas de FAQPage.

## 7. Ce qui compte vraiment, et ce qui ne compte pas

L'audit de septembre 2026 a noté le site **SEO 8/10, GEO 8/10, AEO 9/10**. L'optimisation
interne est faite. Le seul point **critique** est externe : quatre profils `sameAs`
seulement, ce qui ne suffit pas à porter vingt pages.

**Ajouter des pages à un site déjà à 8/10 ne change presque rien.** Si Thomas demande
comment progresser, la réponse est : les annuaires et les citations locales, pas du
contenu supplémentaire. Le dire franchement, même s'il demande une page.
