#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Contrôles avant livraison — site Aurora Solutions.

    python3 .claude/skills/aurora-seo/scripts/verifier.py [racine]

Sortie 0 = livrable. Sortie 1 = au moins une erreur bloquante.
Les AVERTISSEMENTS ne bloquent pas : ils demandent un œil humain.
"""
import sys, os, re, json, glob, html, itertools, collections

RACINE = sys.argv[1] if len(sys.argv) > 1 else "."
SEUIL_OCTETS = 3000          # en dessous : redirection ou page technique
DUP_MAX = 3.0                # % de phrases communes toléré entre deux pages
PHRASE_MIN = 55              # longueur mini d'une phrase comparée
TITRE = (50, 60)
DESC = (120, 160)

erreurs, avertissements = [], []


def err(page, msg):
    erreurs.append("%-46s %s" % (page, msg))


def avert(page, msg):
    avertissements.append("%-46s %s" % (page, msg))


def texte(h):
    h = re.sub(r'(?is)<(script|style)[^>]*>.*?</\1>', ' ', h)
    return html.unescape(re.sub(r'<[^>]+>', ' ', h))


# Éléments purement décoratifs : chevrons « + », icônes, puces. Ils sont dans le
# HTML visible mais jamais dans le balisage FAQPage — les retirer avant comparaison,
# sinon toute page dont le <summary> porte une icône ressort en faux positif.
DECOR = re.compile(r'(?is)<span[^>]*(?:class="[^"]*faq-ic[^"]*"|aria-hidden="true")[^>]*>.*?</span>')


def texte_visible(h):
    """Texte tel qu'un lecteur le lit, icônes décoratives exclues."""
    return html.unescape(re.sub(r'<[^>]+>', '', DECOR.sub('', h))).strip()


def zone_editoriale(s):
    """Hors avis, formulaire, navigation et pied de page — partagés par construction."""
    m = re.search(r'(?is)<!-- PAGE HERO -->(.*?)'
                  r'<!-- (?:AVIS CLIENTS|ZONES|AUTRES ZONES|CTA) -->', s)
    return m.group(1) if m else ""


def phrases(bloc):
    t = re.sub(r'\s+', ' ', texte(bloc))
    return set(p.strip() for p in re.split(r'[.!?]', t) if len(p.strip()) > PHRASE_MIN)


# ── collecte ────────────────────────────────────────────────────────────────
pages = {}
for chemin in sorted(glob.glob(os.path.join(RACINE, "*.html"))):
    src = open(chemin, encoding="utf-8").read()
    if len(src.encode()) < SEUIL_OCTETS:
        continue                                   # stub de redirection
    pages[os.path.basename(chemin)] = src

if not pages:
    print("Aucune page trouvée dans %s" % os.path.abspath(RACINE))
    sys.exit(1)

sitemap = ""
p_sitemap = os.path.join(RACINE, "sitemap.xml")
if os.path.exists(p_sitemap):
    sitemap = open(p_sitemap, encoding="utf-8").read()
else:
    err("sitemap.xml", "ABSENT")

llms = ""
p_llms = os.path.join(RACINE, "llms.txt")
if os.path.exists(p_llms):
    llms = open(p_llms, encoding="utf-8").read()

LEGALES = {"mentions-legales.html", "politique-confidentialite.html", "merci.html"}

# ── contrôles par page ──────────────────────────────────────────────────────
questions = collections.defaultdict(list)
zones = {}

for nom, src in pages.items():
    # --- JSON-LD -----------------------------------------------------------
    graphes = []
    for bloc in re.findall(r'(?is)<script type="application/ld\+json">(.*?)</script>', src):
        try:
            graphes.append(json.loads(bloc))
        except ValueError as e:
            err(nom, "JSON-LD INVALIDE : %s" % e)

    # --- FAQ balisée == visible -------------------------------------------
    vis_q = [texte_visible(x)
             for x in re.findall(r'(?is)<summary[^>]*>(.*?)</summary>', src)]
    vis_a = [texte_visible(x)
             for x in re.findall(r'(?is)</summary>\s*(<p[^>]*>.*?</p>)', src)]
    ld_q, ld_a = [], []
    for g in graphes:
        for n in g.get("@graph", [g]):
            if n.get("@type") == "FAQPage":
                for e in n.get("mainEntity", []):
                    ld_q.append(e.get("name", ""))
                    ld_a.append((e.get("acceptedAnswer") or {}).get("text", ""))
    if ld_q:
        if ld_q != vis_q:
            err(nom, "FAQ : questions balisées != visibles (%d vs %d)" % (len(ld_q), len(vis_q)))
        elif ld_a != vis_a:
            err(nom, "FAQ : réponses balisées != visibles")
    for q in vis_q:
        questions[q].append(nom)

    if nom in LEGALES:
        continue                                   # pas de SEO sur les pages légales

    # --- title / description ----------------------------------------------
    m = re.search(r'(?is)<title>(.*?)</title>', src)
    if not m:
        err(nom, "<title> ABSENT")
    else:
        n = len(html.unescape(m.group(1)).strip())
        if not TITRE[0] <= n <= TITRE[1]:
            err(nom, "title = %d caractères (cible %d-%d)" % (n, TITRE[0], TITRE[1]))
    m = re.search(r'(?is)<meta name="description" content="(.*?)"', src)
    if not m:
        err(nom, "meta description ABSENTE")
    else:
        n = len(html.unescape(m.group(1)).strip())
        if not DESC[0] <= n <= DESC[1]:
            err(nom, "description = %d caractères (cible %d-%d)" % (n, DESC[0], DESC[1]))

    # --- métadonnées structurelles ----------------------------------------
    if 'rel="canonical"' not in src:
        err(nom, "canonical ABSENTE")
    if '"dateModified"' not in src:
        err(nom, "dateModified ABSENTE du JSON-LD")
    for balise in ("og:title", "og:description", "twitter:title", "twitter:description"):
        if balise not in src:
            err(nom, "%s ABSENTE" % balise)
    t = re.search(r'(?is)<title>(.*?)</title>', src)
    o = re.search(r'(?is)<meta property="og:title" content="(.*?)"', src)
    if t and o and html.unescape(t.group(1)).strip() != html.unescape(o.group(1)).strip():
        err(nom, "og:title désynchronisé du <title>")

    if len(re.findall(r'(?is)<h1[^>]*>', src)) != 1:
        err(nom, "%d balises <h1> (il en faut exactement 1)" % len(re.findall(r'(?is)<h1[^>]*>', src)))

    for img in re.findall(r'(?is)<img\b[^>]*>', src):
        if not re.search(r'alt="[^"]+"', img):
            err(nom, "image sans attribut alt")
            break

    # --- présence dans le sitemap et liens entrants ------------------------
    dans_sitemap = nom in sitemap or (nom == "index.html"
                                      and re.search(r'<loc>[^<]*/</loc>', sitemap))
    if sitemap and not dans_sitemap:
        err(nom, "absente de sitemap.xml")
    if llms and nom != "index.html" and nom not in llms:
        avert(nom, "absente de llms.txt")
    entrants = sum(1 for autre, s2 in pages.items()
                   if autre != nom and re.search(r'href="%s' % re.escape(nom), s2))
    if nom != "index.html" and entrants == 0:
        err(nom, "AUCUN lien entrant — la page ne sera pas découverte")

    # --- termes sensibles (avertissements) ---------------------------------
    coeur = zone_editoriale(src) or src
    for marque in ("Schneider", "Legrand", "Wallbox"):
        if marque in coeur:
            err(nom, "marque interdite : %s" % marque)
    if re.search(r'\d\s*(€|euros)|(€|à partir de)\s*\d', texte(coeur)):
        avert(nom, "motif de prix détecté — vérifier")
    if "Géraniums" in src:
        avert(nom, "adresse du siège détectée hors mentions légales")
    if re.search(r'(?i)\bmeilleur\s+(électricien|artisan)', texte(coeur)):
        err(nom, "superlatif interdit (« meilleur électricien »)")
    if re.search(r'(?i)(crédit d.impôt|MaPrimeRénov|subvention)', texte(coeur)) \
            and not re.search(r'(?i)(ne proposons|pas de|aucune aide|ni subvention)', texte(coeur)):
        avert(nom, "mention d'aide financière sans négation — vérifier")

    zones[nom] = phrases(coeur)

# ── contrôles globaux ───────────────────────────────────────────────────────
for q, ou in questions.items():
    if len(ou) > 1:
        err("(site)", "question FAQ dupliquée sur %s : « %s »" % (", ".join(ou), q[:60]))

pire = (0.0, None)
for a, b in itertools.combinations(sorted(zones), 2):
    A, B = zones[a], zones[b]
    if not A or not B:
        continue
    pct = 100.0 * len(A & B) / min(len(A), len(B))
    if pct > DUP_MAX:
        err("(site)", "duplication %.1f%% entre %s et %s" % (pct, a, b))
    if pct > pire[0]:
        pire = (pct, "%s / %s" % (a, b))

titres = [re.search(r'(?is)<title>(.*?)</title>', s).group(1)
          for s in pages.values() if re.search(r'(?is)<title>(.*?)</title>', s)]
for t, n in collections.Counter(titres).items():
    if n > 1:
        err("(site)", "title dupliqué sur %d pages : %s" % (n, t[:60]))

# ── rapport ─────────────────────────────────────────────────────────────────
print("Aurora Solutions — contrôle avant livraison")
print("  %d pages de contenu · %d questions FAQ · duplication max %.1f%% (%s)"
      % (len(pages), len(questions), pire[0], pire[1] or "-"))
print()
if avertissements:
    print("AVERTISSEMENTS (%d) — à vérifier, non bloquants" % len(avertissements))
    for a in avertissements:
        print("  ~ " + a)
    print()
if erreurs:
    print("ERREURS (%d) — livraison bloquée" % len(erreurs))
    for e in erreurs:
        print("  ! " + e)
    sys.exit(1)
print("Aucune erreur bloquante. Livrable.")
sys.exit(0)
