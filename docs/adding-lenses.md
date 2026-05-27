# Adding Lenses to LensWiki

LensWiki is a curated JSON-based library. The website only shows lens records that exist as standalone JSON files in `data/lenses/`.

## Workflow

1. Create or receive a lens JSON record.
2. Save it as `data/lenses/YYYY-clean-lens-name.json`.
3. Commit and push the file to GitHub.
4. Refresh the website.
5. The site automatically discovers the file through the GitHub Contents API and displays it.

## Filename Rules

- Start with a 4-digit year.
- Use lowercase.
- Use hyphens instead of spaces.
- Avoid accents and special characters.
- Write focal lengths as `36-82mm`, `50mm`, or `25-250mm`.
- Keep filenames readable.

Examples:

- `1893-cooke-triplet.json`
- `1920-cooke-speed-panchro-series-i.json`
- `1959-voigtlander-zoomar-36-82mm.json`

## Required Fields

Every lens record must include:

- `id`
- `name`
- `yearIntroduced`

The site also supports richer fields such as `manufacturer`, `publicSummary`, `lookSummary`, `coverage`, `mounts`, `focalLengths`, `tStops`, `opticalFormula`, `characteristics`, `sources`, `confidence`, and `notes`.

Use `isRehoused: true` only when the record describes a rehoused lens or rehoused lens family. Leave it `false` for original cinema lens families, even if modern rehoused copies exist.

Use `data/templates/lens-template.json` as a starting point. The template is not loaded by the website because only files in `data/lenses/` are discovered.
