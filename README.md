# H5Web, a web-based HDF5 file viewer

H5Web is built with React. Check out the demo at https://h5web.netlify.com/.

## Quick start 🚀

```bash
npm install
npm start
```

## Testing

- `npm test`

## Code quality 🔎

- `npm run lint` - run all linting and code formatting commands
- `npm run lint:eslint` - lint all TS and JS files with ESLint
- `npm run lint:tsc` - type-check the whole project, test files included
- `npm run lint:prettier` - check that all files have been formatted with Prettier

### Automatic fixing and formatting

- `npm run lint:eslint --fix` - auto-fix linting issues
- `npm run lint:prettier --write` - format all files with Prettier

### Editor integration

Most editors support fixing and formatting files automatically on save. The configuration for VSCode is provided out of
the box, so all you need to do is install the recommended extensions.

## Continuous integration and deployment

[GitHub Actions](https://github.com/silx-kit/h5web/actions) is used for continuous integration. The current workflow
runs the `lint` and `test` scripts above on push (to any branch).

[Netlify](https://www.netlify.com/) is used for continuous deployment. The project's `master` branch is deployed
automatically to https://h5web.netlify.com/. Netlify also adds its own GitHub Actions workflow and deploys each branch,
commit and pull request individually to URLs of the form:

- https:\//<branch-name\>--h5web.netlify.com/
- https:\//<commit-sha\>--h5web.netlify.com/
- https:\//deploy-preview-<pr-number\>--h5web.netlify.com/