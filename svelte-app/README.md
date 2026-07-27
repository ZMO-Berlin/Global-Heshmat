# Global Heshmat — application

The SvelteKit application behind [heshmat.zmo.de](https://heshmat.zmo.de).

**Documentation lives in the [repository README](../README.md)** — project structure, routes,
the data schema, how to add an artwork or a place of residence, the image pipeline, testing and
deployment are all documented there. This file used to carry a second copy of that material and
had drifted out of step with it, so it now points at the single source instead.

## Quick start

```bash
npm install
npm run dev
```

`npm run validate` runs the full pre-commit gate: format check, lint, type check, unit tests,
production build, and the post-build assertions.
