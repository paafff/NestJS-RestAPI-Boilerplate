// pipeline {
//     agent any

//     stages {
//         stage('Checkout') {
//             steps {
//                 git branch: 'main', url: 'https://github.com/paafff/NestJS-RestAPI-Boilerplate.git'
//             }
//         }
//         stage('Build Docker Image') {
//             steps {
//                 sh 'docker-compose down'
//                 sh 'docker-compose up --build -d'
//             }
//         }
//     }
// }



pipeline {
    agent any

    stages {
        stage('Clone repository') {
            steps {
                git branch: 'main', url: 'https://github.com/paafff/NestJS-RestAPI-Boilerplate.git'
            }
        }

        // stage('Build Docker Image') {
        //     steps {
        //         script {
        //             def app = docker.build('your-app-image')
        //         }
        //     }
        // }


//tes sudo
        stage('Run Docker Compose') {
            steps {

                // -f: Opsi ini digunakan untuk menentukan file docker-compose.yml yang akan digunakan.
                sh 'sudo docker-compose -f /root/NestJS-RestAPI-Boilerplate/docker-compose.yml down' 

                // -d: Opsi ini digunakan untuk menjalankan container dalam mode detached. Artinya, container akan berjalan di latar belakang dan Anda akan mendapatkan kontrol terminal kembali setelah perintah dijalankan.
                sh 'sudo docker-compose -f /root/NestJS-RestAPI-Boilerplate/docker-compose.yml up -d --build'
            }
        }
    }

    post {
        always {
            cleanWs() // Clean up workspace after build
        }
    }
}
