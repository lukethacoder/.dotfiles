#! /bin/bash

DOTFILES(.zshrc)

for dotfile in $(echo ${DOTFILES[*]});
do
  cp ~/Github/.dotfiles/$(echo $dotfile) ~/$(echo $dotfile)
done