def front_build () {
    echo "building the front-end docker image..."
    withCredentials([usernamePassword(
        credentialsId: 'docker-repo', 
        usernameVariable: 'USER',
        passwordVariable: 'PASSWORD'
        )]) {
        sh 'docker build front/ -t hamdiz0/qr-front:1.0 && \
        echo $PASSWORD | docker login -u $USER --password-stdin && \
        docker push hamdiz0/qr-front:1.0'
    }
}
def back-build () {
    echo "building the back-end docker image..."
    withCredentials([usernamePassword(
        credentialsId: 'docker-repo', 
        usernameVariable: 'USER',
        passwordVariable: 'PASSWORD'
        )]) {
        sh 'docker build api/ -t hamdiz0/qr-api:1.0 && \
        echo $PASSWORD | docker login -u $USER --password-stdin && \
        docker push hamdiz0/qr-api:1.0'
    }
}

return this