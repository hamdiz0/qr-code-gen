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
        sed -i "s/<<VERSION>>/${VER}/" "$file" # swap the <<VERSION>> in the YAML files with the passed version VER
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
echo -e "\nfront-url:\n"
minikube service -- front-svc --url



# terminate old forwarding process to avoid conflicts
kill $(ps aux | grep 'kubectl port-forward' | awk '{print $2}')

# port forwarding to access the service 
minikube kubectl -- port-forward svc/front-svc 30000:80 --address 0.0.0.0 > /dev/null 2>&1 &
# get port forwarding proccess id
FRONT_PID=$!

# disown the processes so they won't terminate when the script ends
disown $FRONT_PID

# if you don't disown the forwarding process the script will stay in an execution state and the jenkins build wont end

echo "port forwarding started for front-svc on 30000 "

