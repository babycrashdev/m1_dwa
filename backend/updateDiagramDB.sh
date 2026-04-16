#!/bin/bash
set -e

mkdir -p docs

podman run --rm \
  --network host \
  -v "${PWD}/docs:/output" \
  docker.io/nedix/mermerd:latest \
  --connectionString "mysql://user:user@tcp(127.0.0.1:3306)/rplacedb" \
  --outputFileName /output/db_schema.md \
  --encloseWithMermaidBackticks \
  --useAllTables \
  --schema rplacedb

echo "Schéma généré dans docs"
