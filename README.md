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

Alternatively, you can `trivy` with the experimental option
`--show-suppressed`. The tool `trivy-ignore-check` will automatically
detect that.

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

