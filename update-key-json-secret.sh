#!/bin/bash
gh secret set MAIL_KEYS_JSON --org bcf-websites-24 --repos mail-api --body "$(cat keys.json | base64)"