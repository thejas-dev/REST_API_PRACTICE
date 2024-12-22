pipeline{
    agent any

    stages{
        stage('Checkout'){
            steps{
                checkout scm
            }
        }

        stage("Installing dependencies"){
            steps{
                sh 'npm install'
            }
        }

        stage("Building app"){
            steps{
                sh 'npm build'
            }
        }

        stage("Running app"){
            steps {
                sh 'cd dist && node bundle.js'
            }
        }
    }

    post {
        always {
            // Send notifications, clean up, etc.
            echo 'Pipeline completed'
        }
    }
}