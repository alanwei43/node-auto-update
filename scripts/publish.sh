# docker login docker.pkg.github.com --username alanwei43
docker tag node-auto-update:$1 docker.pkg.github.com/alanwei43/node-auto-update/docker:$1
docker push docker.pkg.github.com/alanwei43/node-auto-update/docker:$1

docker tag node-auto-update:$1 alanway/node-auto-update:$1
docker push alanway/node-auto-update:$1