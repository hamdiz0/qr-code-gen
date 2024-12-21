// build & push function
// image_build(DockerHub Profile/imageName , version , credentialId from jenkins , Dockerfile path)
def image_build(String imageName ,String version ,String credId ,String dockerfilelocation){
    withCredentials([
        usernamePassword(
            credentialsId: "$credId",
            usernameVariable: "USER",
            passwordVariable: "PASSWORD"
        )
    ]){
        sh "docker build $dockerfilelocation -t $imageName:$version"
        sh "echo $PASSWORD | docker login -u $USER --password-stdin"
        sh "docker push $imageName:$version"
    }
}

return this