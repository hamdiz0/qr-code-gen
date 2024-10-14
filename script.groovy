def image_build (String imageName ,String version ,String cred ,String dockerfilelocation) {
    withCredentials([usernamePassword(
        credentialsId: 'docker-repo', 
        usernameVariable: 'USER',
        passwordVariable: 'PASSWORD'
        )]) {
        sh "docker build $dockerfilelocation -t $imageName:$version"
        sh "echo $PASSWORD | docker login -u $USER --password-stdin"
        sh "docker push $imageName:$version"
    }
}

return this