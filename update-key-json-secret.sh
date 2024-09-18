#!/bin/bash
gh secret set MAIL_KEYS_JSON --body "$(cat keys.json | base64)"