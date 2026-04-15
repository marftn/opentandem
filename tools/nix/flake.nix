{
  description = "default";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {nixpkgs, flake-utils, ...}:


    let defineOutput =
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        packagesBasic = with pkgs; [
          # Shells
          fish

          # Essentials.
          git
          just

          # Node
          nodejs_24
          ];
      in
      {
        devShells = {
          default = pkgs.mkShell {
            packages = packagesBasic;
          };
        };
      };

  in
  flake-utils.lib.eachDefaultSystem defineOutput;
}
