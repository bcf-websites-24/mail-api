#!/bin/sh

docker build -t csefest2024-mail-api .      
docker tag csefest2024-mail-api registry.digitalocean.com/csefest2024-registry/csefest2024-mail-api:latest  
docker push registry.digitalocean.com/csefest2024-registry/csefest2024-mail-api:latest   