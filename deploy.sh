#!/bin/bash
# TitleIQ Admin Dashboard - One-Command Deploy
# Usage: ./deploy.sh

cd "$(dirname "$0")"
exec bash scripts/safe-deploy-admin.sh
