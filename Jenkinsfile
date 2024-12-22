pipeline{
    agent any

    triggers {
        pollSCM '* * * * *'
    }

    environment {
        GOOGLE_CLIENT = credentials('google-oauth-credentials')
        TOUSERNAME = 'thejaskala308@gmail.com'
        MIMETYPE = 'text/html'
    }
    
    options {
        timeout(time: 1, unit: 'HOURS') // Limit the pipeline runtime
        retry(3) // Retry up to 3 times if a stage fails
    }

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
                sh 'npm run build'
            }
        }

        stage('Creating environment variables in dist'){
            steps{
                sh '''
                    cd dist
                    touch .env
                    echo "CLIENT_ID=$GOOGLE_CLIENT_USR" >> .env
                    echo "CLIENT_SECRET=$GOOGLE_CLIENT_PSW" >> .env
                    echo "REDIRECT_URI=http://localhost:3333/auth/callback" >> .env
                    echo "SESSION_SECRET=this-is-secret" >> .env
                    cat .env
                '''
            }
        }

        stage("Running app"){
            steps {
                script {
                    // Start the app in the background and get the process ID
                    def pid = sh(script: 'cd dist && node bundle.js & echo $!', returnStdout: true).trim()

                    // Wait for 5 seconds
                    sleep(5)
                    
                    // Kill the process by PID
                    sh "kill ${pid}"
                }
            }
        }

        stage("JSON text Handling") {
            steps {
                script {
                    def jsonString = '{"name":"Thejas Hari", "age":20}';
                    def jsonObj = readJSON text: jsonString

                    assert jsonObj['name'] == 'Thejas Hari'
                    sh "echo ${jsonObj.name}"
                    sh "echo ${jsonObj.age}"
                }
            }
        }

        stage ("JSON File Handling") {
            steps {
                script {
                    def jsonFile = readJSON file: 'test.json'
                    sh "echo ${jsonFile.name}"
                    sh "echo ${jsonFile.age}"
                    sh "echo ${jsonFile.city}"
                }
            }
        }
    }

    post {
        always {
            echo "Pipeline completed"
        }
        changed {
            echo "There is a change in the pipeline state"
        }
        unstable {
            echo 'The pipeline is unstable'
        }
        success {
            mail (
                from: "thejaskala308@gmail.com",
                to: "${TOUSERNAME}",
                subject: "Build Successful: ${env.JOB_NAME} - ${env.BUILD_NUMBER}", 
                mimeType: "${MIMETYPE}",
                body: "The build ${env.BUILD_NUMBER} was successful.\n\nPlease review the build results.\n\nBest regards,\nJenkins",
            )
        }
        failure {
            mail (
                from: "thejaskala308@gmail.com",
                to: "${TOUSERNAME}",
                subject: "Build Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                mimeType: "${MIMETYPE}",
                body: "The build ${env.BUILD_NUMBER} failed.\n\nPlease check the build logs for more details.\n\nBest regards,\nJenkins",
            )
        }
    }
}