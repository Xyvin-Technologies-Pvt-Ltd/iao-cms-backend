# Site Header — `programmes_dropdown`

## (a) Component UID

`shared.link` (same repeatable row model as **Programmes overview hub → `orientation_links`** and **`lifelong_links`**): `label` + `segment`, both required.

## (b) Example API JSON shape

After this change, `programmes_dropdown` is an **array** of link objects (order preserved per locale). Example fragment from a Site Header REST payload:

```json
"programmes_dropdown": [
  { "id": 1, "label": "Master in osteopathy", "segment": "programmes/master" },
  { "id": 2, "label": "Lateral entry", "segment": "programmes/lateral" },
  { "id": 3, "label": "Postgraduate programmes", "segment": "programmes/postacademic" },
  { "id": 4, "label": "All programmes", "segment": "programmes" },
  { "id": 5, "label": "OMT Egypt", "segment": "programmes/omt-egypt" },
  { "id": 6, "label": "Manual therapy", "segment": "programmes/manuele-therapie" }
]
```

IDs are Strapi component instance IDs and may differ. With `populate`, nested shape matches your existing populate depth. The **REST attribute name** remains `programmes_dropdown`.

## (c) Content migration warning

Removing the old `layout.programmes-dropdown` field **drops stored data** for that component in Strapi (old `master`, `lateral`, `postacademic`, `all`, `omt_egypt`, `manual_therapy` values). **Export or copy those strings from the admin (or a DB backup) before deploying** this schema, then re-enter rows as `shared.link` entries per locale.
