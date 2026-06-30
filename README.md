epr-frontend-journey-tests

The template to create a service that runs WDIO tests against an environment.

- [Local](#local)
  - [Requirements](#requirements)
    - [Node.js](#nodejs)
    - [Gitleaks](#gitleaks)
    - [Mise](#mise)
  - [Setup](#setup)
  - [Running local tests](#running-local-tests)
  - [Debugging local tests](#debugging-local-tests)
- [Production](#production)
  - [Debugging tests](#debugging-tests)
- [Licence](#licence)
  - [About the licence](#about-the-licence)

## Local Development

### Requirements

#### Node.js

Please install [Node.js](http://nodejs.org/) `>= v20` and [npm](https://nodejs.org/) `>= v9`. You will find it
easier to use the Node Version Manager [nvm](https://github.com/creationix/nvm)

To use the correct version of Node.js for this application, via nvm:

```bash
nvm use
```

#### Gitleaks

[Gitleaks](https://github.com/gitleaks/gitleaks) is required for pre-commit secret scanning and must be available on your PATH.

The simplest install on macOS/Linux is via [mise](#mise)

```bash
mise trust && mise install
```

Alternatively, install directly:

- macOS: `brew install gitleaks`
- Linux/Windows: see the [gitleaks releases page](https://github.com/gitleaks/gitleaks/releases)

#### Mise

[mise](https://mise.jdx.dev/) - a polyglot version manager that reads `mise.toml` in this repo to install the correct pinned versions

1. [Install](https://mise.jdx.dev/getting-started.html#installing-mise-cli)
2. [Activate](https://mise.jdx.dev/getting-started.html#activate-mise) in your shell

### Setup

Install application dependencies:

```bash
npm install
```

### Additional configuration in Linux

For Linux based machines, you will need to add this entry into your `etc/hosts` file for the tests to run locally:

```
127.0.0.1 defra-id-stub
```

### Running local tests

Start application you are testing on the url specified in `baseUrl` [wdio.local.conf.js](wdio.local.conf.js)

```bash
npm run test:local
```

Running tests with a specific tag locally

```bash
GREP='@delprnexp' npm run test:local:grep
```

If for whatever reason [the stable version of Chrome for Testing](https://googlechromelabs.github.io/chrome-for-testing/#stable)
is not working for you, then you can specify the Chrome version when running locally

```sh
WDIO_CHROME_VERSION=146.0.7680.154 npm run test:local:grep
```

### Debugging local tests

```bash
npm run test:local:debug
```

### Feature flags in journey tests

When behaviour sits behind a feature flag, a single-mode run can only ever cover
one state. The other state goes untested, and any assertion written for the
current state (for example "this banner is absent") silently becomes wrong the
moment the flag flips. This suite keeps both states covered at once and makes
the production switchover config-only, with no test churn.

**Single source of truth.** `test/support/flags.js` reads each `FEATURE_FLAG_*`
env var, one line per active flag. No flag string appears anywhere else in test
code: branch on `flags.<key>` instead. Every key must map to a real
`FEATURE_FLAG_*` var that is exported into both the frontend container and the
wdio runner: no test-only invented flags.

```js
import { flags } from '../support/flags.js'
```

**The flag cannot drift from app behaviour.** The `run-journey-tests` action
writes the flag value to `$GITHUB_ENV` once, so the same value reaches both the
frontend container (via `compose.yml` interpolation) and the runner process (via
`process.env`). That single write is the only plumbing the convention needs.

**Two branching idioms, both through `flags`:**

- _Same journey, different assertions_ — branch on `flags.x` where the pages
  diverge. When the difference is a single assertion (present vs absent), let
  the flag pick the assertion verb rather than writing an `if`/`else`: see the
  closed-period banner check in `summarylogs.enhanced.check.cma.e2e.js`. Reach
  for an inline `if (flags.x) { ... } else { ... }` only when several statements
  diverge.
- _Whole scenario added or removed_ — swap `describe`/`describe.skip` (or
  `it`/`it.skip`), e.g. `;(flags.x ? describe : describe.skip)('new flow', ...)`.
  Skipped specs show as skipped in Allure, not silently absent.

Three-way discipline: legacy-only behaviour goes behind `else` / skip-when-on,
new-only behaviour behind `if` / skip-when-off, and shared behaviour stays
unguarded so it runs in both passes.

**Run-twice matrix.** `check-pull-request.yml` runs the suite once per flag
state. Each pass exports its flag value to both the container and the runner, so
the flag-off pass exercises the legacy plus shared behaviour and the flag-on
pass exercises the new plus shared behaviour.

**Switchover payoff.** Turning the flag on in production is one line in the prod
env file, with zero test changes (both passes stay green). Retiring the flag
later is mechanical: every flag-specific site is an `if`/`else`, an `it.skip`, or
the `flags.<key>` line. Drop the env var wherever it is set, then grep
`flags.<key>` and delete. The cleanup is decoupled from the prod flip and never
blocks it.

## Production

### Running the tests

Tests are run from the CDP-Portal under the Test Suites section. Before any changes can be run, a new docker image must be built, this will happen automatically when a pull request is merged into the `main` branch.
You can check the progress of the build under the actions section of this repository. Builds typically take around 1-2 minutes.

The results of the test run are made available in the portal.

### Running tests with Profile

By default in the CDP-Portal only tests tagged with @smoketest are run. If you wish to run all the tests, pass in `all` in the profile section of the CDP Portal UI.

## Requirements of CDP Environment Tests

1. Your service builds as a docker container using the `.github/workflows/publish.yml`
   The workflow tags the docker images allowing the CDP Portal to identify how the container should be run on the platform.
   It also ensures its published to the correct docker repository.

2. The Dockerfile's entrypoint script should return exit code of 0 if the test suite passes or 1/>0 if it fails

3. Test reports should be published to S3 using the script in `./bin/publish-tests.sh`

## Running on GitHub

Alternatively you can run the test suite as a GitHub workflow.
Test runs on GitHub are not able to connect to the CDP Test environments. Instead, they run the tests agains a version of the services running in docker.
A docker compose `compose.yml` is included as a starting point, which includes the databases (mongodb, redis) and AWS emulator (floci) pre-setup.

Steps:

1. Edit the compose.yml to include your services.
2. Modify the scripts in docker/scripts to pre-populate the database, if required and create any AWS resources.
3. Test the setup locally with `docker compose up` and `npm run test:github`
4. Set up the workflow trigger in `.github/workflows/journey-tests`.

By default, the provided workflow will run when triggered manually from GitHub or when triggered by another workflow.

If you want to use the repository exclusively for running docker composed based test suites consider displaying the publish.yml workflow.

## BrowserStack

Two wdio configuration files are provided to help run the tests using BrowserStack in both a GitHub workflow (`wdio.github.browserstack.conf.js`) and from the CDP Portal (`wdio.browserstack.conf.js`).
They can be run from npm using the `npm run test:browserstack` (for running via portal) and `npm run test:github:browserstack` (from GitHib runner).
See the CDP Documentation for more details.

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government licence v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable
information providers in the public sector to license the use and re-use of their information under a common open
licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
