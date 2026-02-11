[![licence](https://img.shields.io/badge/licence-WTFPL-blue)](http://www.wtfpl.net/)
[![price](https://img.shields.io/badge/price-FREE-green)](https://github.com/gflohr/qgoda/blob/main/LICENSE)
[![coverage](https://img.shields.io/coverallsCoverage/github/gflohr/trivy-ignore-check?branch=main)](https://coveralls.io/github/gflohr/trivy-ignore-check?branch=main)
[![downloads](https://img.shields.io/npm/dw/%40trivy-ignore-check)](https://npmjs.com/package/trivy-ignore-check)

# Trivy Ignore Check <!-- omit from toc -->

Keep your [trivy](https://trivy.dev/) ignore files clean.

## Description

Trivy is a populare vulnerability scanner. It allows you to specify a list
of vulnerabilities by id that should suppressed. By default, this list is read
from a file `.trivyignore` in the current directory.

Such files have the potential to grow because `trivy` does not report any
vulnerabilities listed in the ignore file that do not correspond to a finding.

This is where this tool jumps in. It takes a vulnerability scanning report
and checks it against a `.trivyignore` file. Gratuituous entries are printed
to the console.

## Why

It is good practice to keep the `trivyignore` short. Not only because it
is generally a bad idea to ignore vulnerabilities. But also, because it
makes it hard to keep an overview of the security status of the project,
as it is impossible to see how many vulnerabilities are really ignored.

## Dependencies

You need a recent version of [Node.js](https://nodejs.org/).

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

You may have to prepend `sudo` if you need root privileges.

## Usage

You invoke the tool like this:

```shell
npx trivy-ignore-check .trivyignore trivy-findings.json
```

You have probably guessed already that you have to replace `.trivyignore`
with the path to your `trivy` ignore file, and `trivy-findings.json` with
the path of a file containing the results of a `trivy` scan in JSON format.

If you omit the path to the findings file, standard input is read instead:

```shell
npx trivy-ignore-check .trivyignore
```

## Running the `trivy` Scan

You can invoke `trivy` any way you like, but you will normally have to
invoke without or with an empty `.trivyignore` file (try `/dev/null`).
Otherwise `trivy-check-ignore` will report all entries in the ignore file
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

