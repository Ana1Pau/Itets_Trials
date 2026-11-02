# Djeser-Djeseru: Temple of the Living Mountain

A single-page, interactive exploration of Hatshepsut’s temple at Deir el-Bahari, framed as an architectural study and a possible videogame hub. The plan, 3D model, interior view, and first-person walkthrough are all part of the same page.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

## Publish with GitHub Pages

This package includes a GitHub Actions workflow at `.github/workflows/deploy.yml`. Upload the complete project with GitHub Desktop (or another Git client) so the hidden `.github` folder is included. A browser upload can omit hidden folders.

In the GitHub repository, open **Settings → Pages**, set **Source** to **GitHub Actions**, then push the project to the `main` branch. The included workflow builds and publishes the site automatically. If your default branch is named differently, update `main` in the workflow's `push.branches` setting.

The workflow automatically uses the repository path for project pages and the root path for `username.github.io` repositories.

## Included experience

- **Overview:** rotate and inspect the schematic temple model.
- **Plan:** select zones and follow the east-to-west processional axis.
- **3D model:** orbit and zoom; toggle the cutaway to reveal the inner sequence.
- **Interior:** inspect an interpretive interior view.
- **Walkthrough:** explore in first person with WASD or arrow keys and mouse look. Touch screens have an on-screen movement pad.
- **Architectural index:** select a space to synchronize the plan, model, and description.

The model is an interpretive schematic, not a measured reconstruction. First-person movement has no architectural collision or terrain simulation. Google Fonts are optional; system font fallbacks are included.
