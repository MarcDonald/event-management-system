# Event Management System

A system for the management of event security and stewards.
The system consists of three main pieces:

- An [Android app](android-app/) for Stewards to request assistance from the control room
- A [web dashboard](web-app/) for Control Room Operators to view assistance requests for events, and for Admins to manage Events, Venues, and Staff
- A serverless AWS [backend](cdk-stack/)

## Main Technologies Used

### Android App

- Jetpack Compose
- Kotlin
- Dagger Hilt
- MVVM Architecture

### Web Dashboard

- React
- Function Components and Hooks
- TypeScript
- Styled Components

### Backend

- AWS CDK
- AWS Lambda
- AWS Cognito
- AWS DynamoDB
- AWS API Gateway
