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
                userPassword: true,
            },
            disableOAuth: true,
            generateSecret: true,
        });
    }
}
exports.EmsStack = EmsStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1zLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZW1zLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscUNBQXFDO0FBQ3JDLHNEQUFrRjtBQUVsRixNQUFhLFFBQVMsU0FBUSxHQUFHLENBQUMsS0FBSztJQUNyQyxZQUFZLEtBQW9CLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQ2xFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLE1BQU0sUUFBUSxHQUFHLElBQUksc0JBQVEsQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFO1lBQ25ELFlBQVksRUFBRSxlQUFlO1lBQzdCLGVBQWUsRUFBRSw2QkFBZSxDQUFDLElBQUk7WUFDckMsYUFBYSxFQUFFO2dCQUNiLFFBQVEsRUFBRSxJQUFJO2FBQ2Y7WUFDRCxjQUFjLEVBQUU7Z0JBQ2QsYUFBYSxFQUFFLElBQUk7Z0JBQ25CLGdCQUFnQixFQUFFLElBQUk7Z0JBQ3RCLGdCQUFnQixFQUFFLElBQUk7Z0JBQ3RCLGNBQWMsRUFBRSxLQUFLO2FBQ3RCO1lBQ0Qsa0JBQWtCLEVBQUU7Z0JBQ2xCLFNBQVMsRUFBRTtvQkFDVCxRQUFRLEVBQUUsSUFBSTtvQkFDZCxPQUFPLEVBQUUsSUFBSTtpQkFDZDtnQkFDRCxVQUFVLEVBQUU7b0JBQ1YsUUFBUSxFQUFFLElBQUk7b0JBQ2QsT0FBTyxFQUFFLElBQUk7aUJBQ2Q7YUFDRjtZQUNELGlCQUFpQixFQUFFLElBQUk7WUFDdkIsZ0JBQWdCLEVBQUU7Z0JBQ2hCLFNBQVMsRUFBRSxJQUFJLDZCQUFlLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUM7YUFDbEQ7U0FDRixDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsU0FBUyxDQUFDLGVBQWUsRUFBRTtZQUNsQyxrQkFBa0IsRUFBRSxjQUFjO1lBQ2xDLFNBQVMsRUFBRTtnQkFDVCxZQUFZLEVBQUUsSUFBSTthQUNuQjtZQUNELFlBQVksRUFBRSxJQUFJO1lBQ2xCLGNBQWMsRUFBRSxJQUFJO1NBQ3JCLENBQUMsQ0FBQTtJQUNKLENBQUM7Q0FDRjtBQXpDRCw0QkF5Q0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSBcIkBhd3MtY2RrL2NvcmVcIjtcbmltcG9ydCB7IEFjY291bnRSZWNvdmVyeSwgU3RyaW5nQXR0cmlidXRlLCBVc2VyUG9vbCB9IGZyb20gXCJAYXdzLWNkay9hd3MtY29nbml0b1wiO1xuXG5leHBvcnQgY2xhc3MgRW1zU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogY2RrLkNvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgY29uc3QgdXNlclBvb2wgPSBuZXcgVXNlclBvb2wodGhpcywgXCJlbXMtdXNlci1wb29sXCIsIHtcbiAgICAgIHVzZXJQb29sTmFtZTogXCJFTVMtVXNlci1Qb29sXCIsXG4gICAgICBhY2NvdW50UmVjb3Zlcnk6IEFjY291bnRSZWNvdmVyeS5OT05FLFxuICAgICAgc2lnbkluQWxpYXNlczoge1xuICAgICAgICB1c2VybmFtZTogdHJ1ZVxuICAgICAgfSxcbiAgICAgIHBhc3N3b3JkUG9saWN5OiB7XG4gICAgICAgIHJlcXVpcmVEaWdpdHM6IHRydWUsXG4gICAgICAgIHJlcXVpcmVMb3dlcmNhc2U6IHRydWUsXG4gICAgICAgIHJlcXVpcmVVcHBlcmNhc2U6IHRydWUsXG4gICAgICAgIHJlcXVpcmVTeW1ib2xzOiBmYWxzZVxuICAgICAgfSxcbiAgICAgIHN0YW5kYXJkQXR0cmlidXRlczoge1xuICAgICAgICBnaXZlbk5hbWU6IHtcbiAgICAgICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICAgICAgICBtdXRhYmxlOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIGZhbWlseU5hbWU6IHtcbiAgICAgICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICAgICAgICBtdXRhYmxlOiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBzZWxmU2lnblVwRW5hYmxlZDogdHJ1ZSxcbiAgICAgIGN1c3RvbUF0dHJpYnV0ZXM6IHtcbiAgICAgICAgXCJqb2JSb2xlXCI6IG5ldyBTdHJpbmdBdHRyaWJ1dGUoeyBtdXRhYmxlOiB0cnVlIH0pLFxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdXNlclBvb2wuYWRkQ2xpZW50KCd3ZWItZGFzaGJvYXJkJywge1xuICAgICAgdXNlclBvb2xDbGllbnROYW1lOiAnV2ViRGFzaGJvYXJkJyxcbiAgICAgIGF1dGhGbG93czoge1xuICAgICAgICB1c2VyUGFzc3dvcmQ6IHRydWUsXG4gICAgICB9LFxuICAgICAgZGlzYWJsZU9BdXRoOiB0cnVlLFxuICAgICAgZ2VuZXJhdGVTZWNyZXQ6IHRydWUsXG4gICAgfSlcbiAgfVxufVxuIl19