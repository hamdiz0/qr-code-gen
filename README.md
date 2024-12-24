# Qr-Code-Generator

Based on <a href='https://github.com/rishabkumar7/devops-qr-code'>devops-qr-code</a>

This app generates QR codes based on input URLs. 
It is designed to be flexible, working seamlessly in both internal environments like Kubernetes and external deployments on platforms like Vercel and Render by using NextJS routing features along with environment variables to switch between the two modes

* Front-End built with NextJs
* Api built with python FastApi
* Data Base created with postgres

The user enters a url and click the button to send the url to the api ,the api checks if the url is present in the data-base or not :

* if yes it retrieves the corresponding qr-code and sends it back to the user
* if not it generates a qr-code sends it back to the user and save it in the data-base

<img src='./imgs/qr-code.PNG' style="width:100%">

## `Containerizing the app` :

* building and pushing both the front and api images to docker hub using <a href="./jenkinsfile">JenkinsFile</a> 
* utilized a <a href="./script.groovy">Function</a> template to build and push the images 
  - hamdiz0/qr-front:latest
  - hamdiz0/qr-api:latest
  - postgres:15-alpine (default)

<img src="./imgs/pushed with jenkins.PNG" style="width:100%">


 ## `Runing the app using docker-compose` :

* make sure to set up the right enviroment variables in the <a href="./front/.env">.env</a> file for the internal docker compose environmnet
  ```
  NEXT_PUBLIC_USE_INTERNAL_ROUTE=true
  NEXT_PUBLIC_INTERNAL_API=http://api ("api" is the service name for the api in the docker-compose.yml)
  ```

* the external network can be used but it's not practicle for this case 
  ```
  NEXT_PUBLIC_USE_INTERNAL_ROUTE=false
  NEXT_PUBLIC_EXTERNAL_API=http://localhost:3001 (the api service must be forwarded for this to work)
  ```

* run the app using the Docker files in build/context folders <a href="./docker-compose.yml">view file here</a> :
  ```
  docker compose up --build
  ```

* run the app using the docker images from DockerHub <a href="./docker-compose-images.yml">view file here</a> :
  ```
  docker compose up -f ./docker-compose-images.yml up
  ```
## YAML files :

* set up a deployment with its corresponding service for each component of the app
  - <a href="./k8s-specifications/front-deployment_svc.yml">front-end</a>
  - <a href="./k8s-specifications/api-deployment_svc.yml">api</a>
  - <a href="./k8s-specifications/postgres-deployment_svc.yml">postgres</a>

* utilized a script to manually deploy and test the app on the k8s cluster
    - view the `run.sh` script <a href="./k8s-manifests/run.sh">here</a>
    - view the YAML files <a href="./k8s-manifests">here</a>

## `Deploying the app using render and vercel` :

### `deploying the front end on vercel` :

* create a new project on vercel and link the gitub repo hosting the front end
* choose the right directory containing the front end files
* make sure to select the NextJs framework

  <img src="./imgs/vercel.png" style="width:100%">

* add the necessary environment variables for the external routing mode in `Settings/Environment Varaibles`
  ```
  NEXT_PUBLIC_USE_INTERNAL_ROUTE=true
  NEXT_PUBLIC_EXTERNAL_API=an external api url "https://api.onrender.com"
  ```

  <img src="./imgs/vercel-env.png" style="width:100%">

### `deploying both the api and postgres db on render` :

<img src="./imgs/render.png" style="width:100%">

#### `Setting a Postgres data base` :

* create a new webservice
* make sure to select the nearest region 
* add all the needed information

<img src="./imgs/db.png" style="width:100%">

#### `Setting up the API` :

* create a new webservice
* make sure to select the nearest region 
* select python as the language

<img src="./imgs/api.png" style="width:100%">

* add the Start command :
    ```
    uvicorn main:app --host  0.0.0.0 --port 80
    ```
* add the environment variables along with their values from the postgres service
    ```
    CORS_ORIGIN         // "*" to allow all traffic or set a specific url
    POSTGRES_HOST       // Hostname value from info/connections
    POSTGRES_DB         // Database value from info/connections
    POSTGRES_USER       // Username value from info/connections
    POSTGRES_PASSWORD   // Password value from info/connections
    ```
<img src="./imgs/env.png" style="width:100%">

* the required values are present in the connections part of the postgres db info tab

<img src="./imgs/db-creds.png" style="width:100%">

#### `Results` :

<img src="./imgs/1.png" style="width:100%">

<img src="./imgs/2.png" style="width:100%">

## Checkout my <a href="https://github.com/hamdiz0/LearningDevOps">LearningDevops</a> repo for more details about these tools and devops in general do not hesitate to contribute