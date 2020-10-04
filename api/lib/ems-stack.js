"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cdk = require("@aws-cdk/core");
const aws_cognito_1 = require("@aws-cdk/aws-cognito");
class EmsStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const userPool = new aws_cognito_1.UserPool(this, "ems-user-pool", {
            userPoolName: "EMS-User-Pool",
            accountRecovery: aws_cognito_1.AccountRecovery.NONE,
            signInAliases: {
                username: true
            },
            passwordPolicy: {
                requireDigits: true,
                requireLowercase: true,
                requireUppercase: true,
                requireSymbols: false
            },
            standardAttributes: {
                givenName: {
                    required: true,
                    mutable: true
                },
                familyName: {
                    required: true,
                    mutable: true
                }
            },
            selfSignUpEnabled: true,
            customAttributes: {
                "jobRole": new aws_cognito_1.StringAttribute({ mutable: true }),
            }
        });
        userPool.addClient('web-dashboard', {
            userPoolClientName: 'WebDashboard',
            authFlows: {
                userSrp: true
            },
            disableOAuth: true,
        });
    }
}
exports.EmsStack = EmsStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1zLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZW1zLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscUNBQXFDO0FBQ3JDLHNEQUFrRjtBQUVsRixNQUFhLFFBQVMsU0FBUSxHQUFHLENBQUMsS0FBSztJQUNyQyxZQUFZLEtBQW9CLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQ2xFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLE1BQU0sUUFBUSxHQUFHLElBQUksc0JBQVEsQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFO1lBQ25ELFlBQVksRUFBRSxlQUFlO1lBQzdCLGVBQWUsRUFBRSw2QkFBZSxDQUFDLElBQUk7WUFDckMsYUFBYSxFQUFFO2dCQUNiLFFBQVEsRUFBRSxJQUFJO2FBQ2Y7WUFDRCxjQUFjLEVBQUU7Z0JBQ2QsYUFBYSxFQUFFLElBQUk7Z0JBQ25CLGdCQUFnQixFQUFFLElBQUk7Z0JBQ3RCLGdCQUFnQixFQUFFLElBQUk7Z0JBQ3RCLGNBQWMsRUFBRSxLQUFLO2FBQ3RCO1lBQ0Qsa0JBQWtCLEVBQUU7Z0JBQ2xCLFNBQVMsRUFBRTtvQkFDVCxRQUFRLEVBQUUsSUFBSTtvQkFDZCxPQUFPLEVBQUUsSUFBSTtpQkFDZDtnQkFDRCxVQUFVLEVBQUU7b0JBQ1YsUUFBUSxFQUFFLElBQUk7b0JBQ2QsT0FBTyxFQUFFLElBQUk7aUJBQ2Q7YUFDRjtZQUNELGlCQUFpQixFQUFFLElBQUk7WUFDdkIsZ0JBQWdCLEVBQUU7Z0JBQ2hCLFNBQVMsRUFBRSxJQUFJLDZCQUFlLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUM7YUFDbEQ7U0FDRixDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsU0FBUyxDQUFDLGVBQWUsRUFBRTtZQUNsQyxrQkFBa0IsRUFBRSxjQUFjO1lBQ2xDLFNBQVMsRUFBRTtnQkFDVCxPQUFPLEVBQUUsSUFBSTthQUNkO1lBQ0QsWUFBWSxFQUFFLElBQUk7U0FDbkIsQ0FBQyxDQUFBO0lBQ0osQ0FBQztDQUNGO0FBeENELDRCQXdDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tIFwiQGF3cy1jZGsvY29yZVwiO1xuaW1wb3J0IHsgQWNjb3VudFJlY292ZXJ5LCBTdHJpbmdBdHRyaWJ1dGUsIFVzZXJQb29sIH0gZnJvbSBcIkBhd3MtY2RrL2F3cy1jb2duaXRvXCI7XG5cbmV4cG9ydCBjbGFzcyBFbXNTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBjZGsuQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICBjb25zdCB1c2VyUG9vbCA9IG5ldyBVc2VyUG9vbCh0aGlzLCBcImVtcy11c2VyLXBvb2xcIiwge1xuICAgICAgdXNlclBvb2xOYW1lOiBcIkVNUy1Vc2VyLVBvb2xcIixcbiAgICAgIGFjY291bnRSZWNvdmVyeTogQWNjb3VudFJlY292ZXJ5Lk5PTkUsXG4gICAgICBzaWduSW5BbGlhc2VzOiB7XG4gICAgICAgIHVzZXJuYW1lOiB0cnVlXG4gICAgICB9LFxuICAgICAgcGFzc3dvcmRQb2xpY3k6IHtcbiAgICAgICAgcmVxdWlyZURpZ2l0czogdHJ1ZSxcbiAgICAgICAgcmVxdWlyZUxvd2VyY2FzZTogdHJ1ZSxcbiAgICAgICAgcmVxdWlyZVVwcGVyY2FzZTogdHJ1ZSxcbiAgICAgICAgcmVxdWlyZVN5bWJvbHM6IGZhbHNlXG4gICAgICB9LFxuICAgICAgc3RhbmRhcmRBdHRyaWJ1dGVzOiB7XG4gICAgICAgIGdpdmVuTmFtZToge1xuICAgICAgICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgICAgICAgIG11dGFibGU6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgZmFtaWx5TmFtZToge1xuICAgICAgICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgICAgICAgIG11dGFibGU6IHRydWVcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHNlbGZTaWduVXBFbmFibGVkOiB0cnVlLFxuICAgICAgY3VzdG9tQXR0cmlidXRlczoge1xuICAgICAgICBcImpvYlJvbGVcIjogbmV3IFN0cmluZ0F0dHJpYnV0ZSh7IG11dGFibGU6IHRydWUgfSksXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB1c2VyUG9vbC5hZGRDbGllbnQoJ3dlYi1kYXNoYm9hcmQnLCB7XG4gICAgICB1c2VyUG9vbENsaWVudE5hbWU6ICdXZWJEYXNoYm9hcmQnLFxuICAgICAgYXV0aEZsb3dzOiB7XG4gICAgICAgIHVzZXJTcnA6IHRydWVcbiAgICAgIH0sXG4gICAgICBkaXNhYmxlT0F1dGg6IHRydWUsXG4gICAgfSlcbiAgfVxufVxuIl19