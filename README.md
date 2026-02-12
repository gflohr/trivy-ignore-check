[![licence](https://img.shields.io/badge/licence-WTFPL-blue)](http://www.wtfpl.net/)
[![price](https://img.shields.io/badge/price-FREE-green)](https://github.com/gflohr/qgoda/blob/main/LICENSE)
[![coverage](https://img.shields.io/coverallsCoverage/github/gflohr/trivy-ignore-check?branch=main)](https://coveralls.io/github/gflohr/trivy-ignore-check?branch=main)
[![downloads](https://img.shields.io/npm/dw/%40trivy-ignore-check)](https://npmjs.com/package/trivy-ignore-check)
[![stand with](https://img.shields.io/badge/stand%20with-Ukraine🇺🇦-ffc107)](https://www.standwithukraineeurope.com/en/)

# Trivy Ignore Check <!-- omit from toc -->

Keep your [`.trivyignore`](https://trivy.dev/) files clean.

- [Description](#description)
- [Why](#why)
- [Dependencies](#dependencies)
- [Installation](#installation)
- [Usage](#usage)
- [Running the Trivy Scan](#running-the-trivy-scan)
- [Pipeline Integration](#pipeline-integration)
	- [GitHub Actions](#github-actions)
	- [Azure DevOps](#azure-devops)
- [Reporting Bugs](#reporting-bugs)
- [Copyright](#copyright)
- [Disclaimer](#disclaimer)

## Description

Trivy is a popular vulnerability scanner. It allows you to specify a list
of vulnerabilities by id that should suppressed. By default, Trivy reads this
list from a `.trivyignore` file in the current directory.

These files can grow indefinitely because Trivy does not report vulnerabilities
listed in the ignore file that are no longer present in the scan results.

This is where this tool comes in. It takes a vulnerability scanning report
and checks it against a `.trivyignore` file. Unnecessary entries are printed
to the console.

## Why

It is good practice to keep the `trivyignore` short. Not only because it
is generally a bad idea to ignore vulnerabilities. But also, because
ignoring vulnerabilities that no longer exist can clutter your view of real
security risks.

## Dependencies

You need a recent version of [Node.js](https://nodejs.org/).

Apart from that, the tool has zero runtime dependencies.

## Installation

This tool is meant to be run inside of a CI/CD pipeline, and there is normally
no need to install it, as long as `node` is present. One of the following
invocations will work:

```shell
npx trivy-ignore-check
npm exec trivy-ignore-check
pnpm dlx trivy-ignore-check
yarn dlx trivy-ignore-check
bunx trivy-ignore-check
```

If you can't help, install it globally on your machine with one of the
following commands:

```shell
npm install -g trivy-ignore-check
pnpm add -g trivy-ignore-check
yarn global add trivy-ignore-check
bun add -g trivy-ignore-check
```

You may need to prepend `sudo` if you need root privileges in Un*x
environments.

## Usage

You invoke the tool like this:

```shell
npx trivy-ignore-check .trivyignore trivy-findings-1.json trivy-findings-2.json
```

Replace `.trivyignore` with your Trivy ignore file path, and
`trivy-findings.json` with the path to a Trivy scan report in JSON format.
If you omit the path to the findings file, standard input is read instead:

```shell
npx trivy-ignore-check .trivyignore
```

In this case, you can only use one scan report.

## Running the Trivy Scan

You can invoke `trivy` any way you like, but you will normally have to
invoke without or with an empty `.trivyignore` file (try `/dev/null`).
Otherwise `trivy-ignore-check` will report all entries in the ignore file
as unnecessary.

You cannot run `trivy`with the experimental option `--show-suppressed`. The
output format will not be recognised. That may change, once the option
`--show-suppressed` is no longer experimental.

## Pipeline Integration

The tool terminates with exit code 0 (success) if no unnecessary ignore
entries have been found or 2 if there were such entries. Every other error
code means that the tool has failed for some other reason. It is
probably a good idea to make these failures non-fatal, and let the
pipeline continue with a warning.

The tool does *not* make an attempt to patch the `.trivyignore` file, leave
alone create a pull request. The structure of the `.trivyignore` file can
differ significantly between organisations and projects, and the file
is security relevant. If you want to automate the clean-up of the ignore
file, implement an approach that fits your needs yourself. It will be
simple with the output of `trivy-ignore-check`.

### GitHub Actions

In GitHub Actions, you can add a job like this:

```yaml
jobs:
  trivy-ignore-check:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      # Install latest Trivy. Replace "latest" with something like "v0.69.1" to
      # lock the version.
      - name: Install Trivy
        uses: aquasecurity/trivy-action@0.20.0
        with:
          version: latest

      - name: Scan first image
        run: |
          set -euo pipefail
          trivy image --quiet --ignorefile /dev/null \
            --severity HIGH,CRITICAL --format json my-image-1:latest \
            > report-1.json

      - name: Scan second image
        run: |
          set -euo pipefail
          trivy image --quiet --ignorefile /dev/null \
            --severity HIGH,CRITICAL --format json my-image-2:latest \
            > report-2.json

      - name: Check for unnecessary .trivyignore entries
        run: |
          set -euo pipefail
          npx --yes trivy-ignore-check .trivyignore report-1.json report-2.json
        continue-on-error: true
```

If you only scan a single image, you can pipe the output directly:

```yaml
      - name: Scan and check ignore file
        run: |
          set -euo pipefail
          trivy image --quiet --ignorefile /dev/null \
            --severity HIGH,CRITICAL --format json my-image:latest \
            | npx --yes trivy-ignore-check .trivyignore
        continue-on-error: true
```

### Azure DevOps

In Azure DevOps, you will typically add something like this to your pipeline:

```yaml
trigger:
- main

pool:
  vmImage: 'ubuntu-latest'

steps:
- checkout: self
  displayName: 'Checkout repository'

# Install latest Trivy. Replace "latest" with something like "v0.69.1" to
# lock the version.
- script: |
    set -euo pipefail
    curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin latest
  displayName: 'Install Trivy'

# Install Node.js (required for npx).
- task: NodeTool@0
  inputs:
    versionSpec: '22.x'
  displayName: 'Install Node.js'

- script: |
    set -euo pipefail
    npm ci
  displayName: 'Install dependencies'

- script: |
    set -euo pipefail
    trivy image --quiet --ignorefile /dev/null \
      --severity HIGH,CRITICAL --format json my-image-1:latest \
      > report-1.json
  displayName: 'Trivy scan image 1'

- script: |
    set -euo pipefail
    trivy image --quiet --ignorefile /dev/null \
      --severity HIGH,CRITICAL --format json my-image-2:latest \
      > report-2.json
  displayName: 'Trivy scan image 2'

- script: |
    set -euo pipefail
    npx --yes trivy-ignore-check .trivyignore report-1.json report-2.json
  displayName: 'Find unneeded .trivyignore entries'
  continueOnError: true
```

If you perform only one scan, you can combine it into a single step:

```yaml
- script: |
    set -euo pipefail
    trivy image --quiet --ignorefile /dev/null \
      --severity HIGH,CRITICAL --format json my-image:latest \
      | npx --yes trivy-ignore-check .trivyignore
  displayName: 'Find unneeded .trivyignore entries'
  continueOnError: true
```

## Reporting Bugs

Please report bugs at https://github.com/gflohr/trivy-ignore-check/issues.

## Copyright

Copyright (C) 2026 Guido Flohr <guido.flohr@cantanea.com>, all
rights reserved.

This is free software available under the terms of the
[WTFPL](http://www.wtfpl.net/).

## Disclaimer

This free software has been written with the greatest possible care, but like
all software it may contain errors. Use at your own risk! There is no
warranty and no liability.

