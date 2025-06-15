{pkgs ? (import <nixpkgs> { 
    # config.allowUnfree = true;
    # config.segger-jlink.acceptLicense = true; 
}), ... }:
pkgs.mkShell {
  buildInputs = with pkgs; [
    nodejs
    mongodb-5_0
    nodePackages.typescript-language-server
  ];
  shellHook = ''
    mongod --dbpath ./mongodb/ >mongo.log 2>&1 &
    trap "pkill mongod" EXIT
  '';
}
