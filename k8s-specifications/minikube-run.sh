#!/bin/bash

VER="latest" #default the version to latest

# accept version with -v 
while getopts "v:" opt; do
  case $opt in
    v) VER=$OPTARG;;
  esac
done

DIR=. # set the directory to the default

echo "applying k8s yaml files"

for file in "$DIR"/*.y*ml; do
    if [ -f "$file" ]; then
        echo "applying $file ..."
        minikube kubectl -- apply -f "$file"
    else
        echo "no yaml files in : $DIR"
        break
    fi
done

echo -e "\nstarting pods ...\n"

minikube kubectl -- rollout status all

echo -e "\nkubectl get all :\n"
minikube kubectl -- get all
echo -e "\nvote-url:\n"
minikube service -- front --url


echo "port forwarding started for front on 30000."

