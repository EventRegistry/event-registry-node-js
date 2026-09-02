#!/usr/bin/env bash
set -euo pipefail

# Bridge the EVENTREGISTRY_API_KEY secret into the settings.json file that the
# EventRegistry client loads by default (new EventRegistry() with no apiKey).
# This lets the examples and the jasmine test suite authenticate against the
# live Event Registry API without changing source code.
#
# settings.json is gitignored and regenerated on every boot, so the key is
# never committed to the repository nor baked into an environment snapshot.
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SETTINGS_FILE="${ROOT_DIR}/settings.json"

if [ -n "${EVENTREGISTRY_API_KEY:-}" ]; then
    umask 077
    printf '{"apiKey": "%s"}\n' "${EVENTREGISTRY_API_KEY}" > "${SETTINGS_FILE}"
    echo "start.sh: wrote ${SETTINGS_FILE} using EVENTREGISTRY_API_KEY."
else
    # Remove any stale settings file so behavior is deterministic across boots.
    rm -f "${SETTINGS_FILE}"
    echo "start.sh: EVENTREGISTRY_API_KEY is not set; skipping settings.json." \
         "Live API queries and the jasmine test suite will not authenticate."
fi
