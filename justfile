# Build and run the opencode container image
opencode *args:
    podman build -t opencode -f .docker/opencode .
    podman run -it --rm \
      -v $(pwd):/workspace:Z \
      -v $(pwd)/.docker/.env.opencode:/workspace/.env:Z \
      -v ~/.local/share/opencode:/root/.local/share/opencode:Z \
      -w /workspace \
      opencode {{args}}
