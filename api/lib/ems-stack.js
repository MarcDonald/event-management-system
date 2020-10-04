"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cdk = require("@aws-cdk/core");
const aws_cognito_1 = require("@aws-cdk/aws-cognito");
const aws_iam_1 = require("@aws-cdk/aws-iam");
class EmsStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const userPool = new aws_cognito_1.UserPool(this, 'ems-user-pool', {
            userPoolName: 'EMS-User-Pool',
            accountRecovery: aws_cognito_1.AccountRecovery.NONE,
            signInAliases: {
                username: true,
            },
            passwordPolicy: {
                requireDigits: true,
                requireLowercase: true,
                requireUppercase: true,
                requireSymbols: false,
            },
            standardAttributes: {
                givenName: {
                    required: true,
                    mutable: true,
                },
                familyName: {
                    required: true,
                    mutable: true,
                },
            },
            selfSignUpEnabled: true,
            customAttributes: {
                'jobRole': new aws_cognito_1.StringAttribute({ mutable: true }),
            },
        });
        const webDashboardUserPoolClient = userPool.addClient('web-dashboard', {
            userPoolClientName: 'WebDashboard',
            preventUserExistenceErrors: true,
            authFlows: {
                userSrp: true,
            },
            disableOAuth: true,
            supportedIdentityProviders: [aws_cognito_1.UserPoolClientIdentityProvider.COGNITO],
        });
        const identityPool = new aws_cognito_1.CfnIdentityPool(this, 'ems-identity-pool', {
            allowUnauthenticatedIdentities: false,
            identityPoolName: 'EMS-Identity-Pool',
            cognitoIdentityProviders: [
                {
                    clientId: webDashboardUserPoolClient.userPoolClientId,
                    providerName: userPool.userPoolProviderName,
                },
            ],
        });
        const unauthenticatedRole = new aws_iam_1.Role(this, 'EMSDefaultUnauthenticatedRole', {
            roleName: 'EMS-Default-Unauthenticated',
            assumedBy: new aws_iam_1.FederatedPrincipal('cognito-identity.amazonaws.com', {
                'StringEquals': { 'cognito-identity.amazonaws.com:aud': identityPool.ref },
                'ForAnyValue:StringLike': { 'cognito-identity.amazonaws.com:amr': 'unauthenticated' },
            }, 'sts:AssumeRoleWithWebIdentity'),
        });
        unauthenticatedRole.addToPolicy(new aws_iam_1.PolicyStatement({
            effect: aws_iam_1.Effect.ALLOW,
            actions: [
                "mobileanalytics:PutEvents",
                "cognito-sync:*"
            ],
            resources: ["*"],
        }));
        const authenticatedRole = new aws_iam_1.Role(this, 'EMSDefaultAuthenticatedRole', {
            roleName: 'EMS-Default-Authenticated',
            assumedBy: new aws_iam_1.FederatedPrincipal('cognito-identity.amazonaws.com', {
                "StringEquals": { "cognito-identity.amazonaws.com:aud": identityPool.ref },
                "ForAnyValue:StringLike": { "cognito-identity.amazonaws.com:amr": "authenticated" },
            }, "sts:AssumeRoleWithWebIdentity"),
        });
        authenticatedRole.addToPolicy(new aws_iam_1.PolicyStatement({
            effect: aws_iam_1.Effect.ALLOW,
            actions: [
                "mobileanalytics:PutEvents",
                "cognito-sync:*",
                "cognito-identity:*"
            ],
            resources: ["*"],
        }));
        const identityPoolRoleAttachment = new aws_cognito_1.CfnIdentityPoolRoleAttachment(this, 'EMSIdentityPoolRoleAttachment', {
            identityPoolId: identityPool.ref,
            roles: {
                'unauthenticated': unauthenticatedRole.roleArn,
                'authenticated': authenticatedRole.roleArn
            }
        });
    }
}
exports.EmsStack = EmsStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1zLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZW1zLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscUNBQXFDO0FBQ3JDLHNEQU04QjtBQUM5Qiw4Q0FBcUY7QUFFckYsTUFBYSxRQUFTLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDckMsWUFBWSxLQUFvQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUNsRSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixNQUFNLFFBQVEsR0FBRyxJQUFJLHNCQUFRLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRTtZQUNuRCxZQUFZLEVBQUUsZUFBZTtZQUM3QixlQUFlLEVBQUUsNkJBQWUsQ0FBQyxJQUFJO1lBQ3JDLGFBQWEsRUFBRTtnQkFDYixRQUFRLEVBQUUsSUFBSTthQUNmO1lBQ0QsY0FBYyxFQUFFO2dCQUNkLGFBQWEsRUFBRSxJQUFJO2dCQUNuQixnQkFBZ0IsRUFBRSxJQUFJO2dCQUN0QixnQkFBZ0IsRUFBRSxJQUFJO2dCQUN0QixjQUFjLEVBQUUsS0FBSzthQUN0QjtZQUNELGtCQUFrQixFQUFFO2dCQUNsQixTQUFTLEVBQUU7b0JBQ1QsUUFBUSxFQUFFLElBQUk7b0JBQ2QsT0FBTyxFQUFFLElBQUk7aUJBQ2Q7Z0JBQ0QsVUFBVSxFQUFFO29CQUNWLFFBQVEsRUFBRSxJQUFJO29CQUNkLE9BQU8sRUFBRSxJQUFJO2lCQUNkO2FBQ0Y7WUFDRCxpQkFBaUIsRUFBRSxJQUFJO1lBQ3ZCLGdCQUFnQixFQUFFO2dCQUNoQixTQUFTLEVBQUUsSUFBSSw2QkFBZSxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDO2FBQ2xEO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsTUFBTSwwQkFBMEIsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLGVBQWUsRUFBRTtZQUNuQixrQkFBa0IsRUFBRSxjQUFjO1lBQ2xDLDBCQUEwQixFQUFFLElBQUk7WUFDaEMsU0FBUyxFQUFFO2dCQUNULE9BQU8sRUFBRSxJQUFJO2FBQ2Q7WUFDRCxZQUFZLEVBQUUsSUFBSTtZQUNsQiwwQkFBMEIsRUFBRSxDQUFDLDRDQUE4QixDQUFDLE9BQU8sQ0FBQztTQUNyRSxDQUNsRCxDQUFDO1FBRUYsTUFBTSxZQUFZLEdBQUcsSUFBSSw2QkFBZSxDQUFDLElBQUksRUFBRSxtQkFBbUIsRUFBRTtZQUNsRSw4QkFBOEIsRUFBRSxLQUFLO1lBQ3JDLGdCQUFnQixFQUFFLG1CQUFtQjtZQUNyQyx3QkFBd0IsRUFBRTtnQkFDeEI7b0JBQ0UsUUFBUSxFQUFFLDBCQUEwQixDQUFDLGdCQUFnQjtvQkFDckQsWUFBWSxFQUFFLFFBQVEsQ0FBQyxvQkFBb0I7aUJBQzVDO2FBQ0Y7U0FDRixDQUFDLENBQUM7UUFFSCxNQUFNLG1CQUFtQixHQUFHLElBQUksY0FBSSxDQUFDLElBQUksRUFBRSwrQkFBK0IsRUFBRTtZQUMxRSxRQUFRLEVBQUUsNkJBQTZCO1lBQ3ZDLFNBQVMsRUFBRSxJQUFJLDRCQUFrQixDQUFDLGdDQUFnQyxFQUFFO2dCQUNsRSxjQUFjLEVBQUUsRUFBRSxvQ0FBb0MsRUFBRSxZQUFZLENBQUMsR0FBRyxFQUFFO2dCQUMxRSx3QkFBd0IsRUFBRSxFQUFFLG9DQUFvQyxFQUFFLGlCQUFpQixFQUFFO2FBQ3RGLEVBQUUsK0JBQStCLENBQUM7U0FDcEMsQ0FBQyxDQUFDO1FBRUgsbUJBQW1CLENBQUMsV0FBVyxDQUFDLElBQUkseUJBQWUsQ0FBQztZQUNFLE1BQU0sRUFBRSxnQkFBTSxDQUFDLEtBQUs7WUFDcEIsT0FBTyxFQUFFO2dCQUNQLDJCQUEyQjtnQkFDM0IsZ0JBQWdCO2FBQ2pCO1lBQ0QsU0FBUyxFQUFFLENBQUMsR0FBRyxDQUFDO1NBQ2pCLENBQUMsQ0FBQyxDQUFDO1FBRXhELE1BQU0saUJBQWlCLEdBQUcsSUFBSSxjQUFJLENBQUMsSUFBSSxFQUFFLDZCQUE2QixFQUFFO1lBQ3RFLFFBQVEsRUFBRSwyQkFBMkI7WUFDckMsU0FBUyxFQUFFLElBQUksNEJBQWtCLENBQUMsZ0NBQWdDLEVBQUU7Z0JBQ2xFLGNBQWMsRUFBRSxFQUFFLG9DQUFvQyxFQUFFLFlBQVksQ0FBQyxHQUFHLEVBQUU7Z0JBQzFFLHdCQUF3QixFQUFFLEVBQUUsb0NBQW9DLEVBQUUsZUFBZSxFQUFFO2FBQ3BGLEVBQUUsK0JBQStCLENBQUM7U0FDcEMsQ0FBQyxDQUFDO1FBRUgsaUJBQWlCLENBQUMsV0FBVyxDQUFDLElBQUkseUJBQWUsQ0FBQztZQUNFLE1BQU0sRUFBRSxnQkFBTSxDQUFDLEtBQUs7WUFDcEIsT0FBTyxFQUFFO2dCQUNQLDJCQUEyQjtnQkFDM0IsZ0JBQWdCO2dCQUNoQixvQkFBb0I7YUFDckI7WUFDRCxTQUFTLEVBQUUsQ0FBQyxHQUFHLENBQUM7U0FDakIsQ0FBQyxDQUFDLENBQUM7UUFFdEQsTUFBTSwwQkFBMEIsR0FBRyxJQUFJLDJDQUE2QixDQUFDLElBQUksRUFBRSwrQkFBK0IsRUFBRTtZQUMxRyxjQUFjLEVBQUUsWUFBWSxDQUFDLEdBQUc7WUFDaEMsS0FBSyxFQUFFO2dCQUNMLGlCQUFpQixFQUFFLG1CQUFtQixDQUFDLE9BQU87Z0JBQzlDLGVBQWUsRUFBRSxpQkFBaUIsQ0FBQyxPQUFPO2FBQzNDO1NBQ0YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBakdELDRCQWlHQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdAYXdzLWNkay9jb3JlJztcbmltcG9ydCB7XG4gIEFjY291bnRSZWNvdmVyeSxcbiAgQ2ZuSWRlbnRpdHlQb29sLCBDZm5JZGVudGl0eVBvb2xSb2xlQXR0YWNobWVudCxcbiAgU3RyaW5nQXR0cmlidXRlLFxuICBVc2VyUG9vbCxcbiAgVXNlclBvb2xDbGllbnRJZGVudGl0eVByb3ZpZGVyLFxufSBmcm9tICdAYXdzLWNkay9hd3MtY29nbml0byc7XG5pbXBvcnQgeyBFZmZlY3QsIEZlZGVyYXRlZFByaW5jaXBhbCwgUG9saWN5U3RhdGVtZW50LCBSb2xlIH0gZnJvbSAnQGF3cy1jZGsvYXdzLWlhbSc7XG5cbmV4cG9ydCBjbGFzcyBFbXNTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBjZGsuQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICBjb25zdCB1c2VyUG9vbCA9IG5ldyBVc2VyUG9vbCh0aGlzLCAnZW1zLXVzZXItcG9vbCcsIHtcbiAgICAgIHVzZXJQb29sTmFtZTogJ0VNUy1Vc2VyLVBvb2wnLFxuICAgICAgYWNjb3VudFJlY292ZXJ5OiBBY2NvdW50UmVjb3ZlcnkuTk9ORSxcbiAgICAgIHNpZ25JbkFsaWFzZXM6IHtcbiAgICAgICAgdXNlcm5hbWU6IHRydWUsXG4gICAgICB9LFxuICAgICAgcGFzc3dvcmRQb2xpY3k6IHtcbiAgICAgICAgcmVxdWlyZURpZ2l0czogdHJ1ZSxcbiAgICAgICAgcmVxdWlyZUxvd2VyY2FzZTogdHJ1ZSxcbiAgICAgICAgcmVxdWlyZVVwcGVyY2FzZTogdHJ1ZSxcbiAgICAgICAgcmVxdWlyZVN5bWJvbHM6IGZhbHNlLFxuICAgICAgfSxcbiAgICAgIHN0YW5kYXJkQXR0cmlidXRlczoge1xuICAgICAgICBnaXZlbk5hbWU6IHtcbiAgICAgICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICAgICAgICBtdXRhYmxlOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICBmYW1pbHlOYW1lOiB7XG4gICAgICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgICAgICAgbXV0YWJsZTogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBzZWxmU2lnblVwRW5hYmxlZDogdHJ1ZSxcbiAgICAgIGN1c3RvbUF0dHJpYnV0ZXM6IHtcbiAgICAgICAgJ2pvYlJvbGUnOiBuZXcgU3RyaW5nQXR0cmlidXRlKHsgbXV0YWJsZTogdHJ1ZSB9KSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBjb25zdCB3ZWJEYXNoYm9hcmRVc2VyUG9vbENsaWVudCA9IHVzZXJQb29sLmFkZENsaWVudCgnd2ViLWRhc2hib2FyZCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlclBvb2xDbGllbnROYW1lOiAnV2ViRGFzaGJvYXJkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJldmVudFVzZXJFeGlzdGVuY2VFcnJvcnM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dGhGbG93czoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJTcnA6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVPQXV0aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VwcG9ydGVkSWRlbnRpdHlQcm92aWRlcnM6IFtVc2VyUG9vbENsaWVudElkZW50aXR5UHJvdmlkZXIuQ09HTklUT10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICk7XG5cbiAgICBjb25zdCBpZGVudGl0eVBvb2wgPSBuZXcgQ2ZuSWRlbnRpdHlQb29sKHRoaXMsICdlbXMtaWRlbnRpdHktcG9vbCcsIHtcbiAgICAgIGFsbG93VW5hdXRoZW50aWNhdGVkSWRlbnRpdGllczogZmFsc2UsXG4gICAgICBpZGVudGl0eVBvb2xOYW1lOiAnRU1TLUlkZW50aXR5LVBvb2wnLFxuICAgICAgY29nbml0b0lkZW50aXR5UHJvdmlkZXJzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBjbGllbnRJZDogd2ViRGFzaGJvYXJkVXNlclBvb2xDbGllbnQudXNlclBvb2xDbGllbnRJZCxcbiAgICAgICAgICBwcm92aWRlck5hbWU6IHVzZXJQb29sLnVzZXJQb29sUHJvdmlkZXJOYW1lLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9KTtcblxuICAgIGNvbnN0IHVuYXV0aGVudGljYXRlZFJvbGUgPSBuZXcgUm9sZSh0aGlzLCAnRU1TRGVmYXVsdFVuYXV0aGVudGljYXRlZFJvbGUnLCB7XG4gICAgICByb2xlTmFtZTogJ0VNUy1EZWZhdWx0LVVuYXV0aGVudGljYXRlZCcsXG4gICAgICBhc3N1bWVkQnk6IG5ldyBGZWRlcmF0ZWRQcmluY2lwYWwoJ2NvZ25pdG8taWRlbnRpdHkuYW1hem9uYXdzLmNvbScsIHtcbiAgICAgICAgJ1N0cmluZ0VxdWFscyc6IHsgJ2NvZ25pdG8taWRlbnRpdHkuYW1hem9uYXdzLmNvbTphdWQnOiBpZGVudGl0eVBvb2wucmVmIH0sXG4gICAgICAgICdGb3JBbnlWYWx1ZTpTdHJpbmdMaWtlJzogeyAnY29nbml0by1pZGVudGl0eS5hbWF6b25hd3MuY29tOmFtcic6ICd1bmF1dGhlbnRpY2F0ZWQnIH0sXG4gICAgICB9LCAnc3RzOkFzc3VtZVJvbGVXaXRoV2ViSWRlbnRpdHknKSxcbiAgICB9KTtcblxuICAgIHVuYXV0aGVudGljYXRlZFJvbGUuYWRkVG9Qb2xpY3kobmV3IFBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWZmZWN0OiBFZmZlY3QuQUxMT1csXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtb2JpbGVhbmFseXRpY3M6UHV0RXZlbnRzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNvZ25pdG8tc3luYzoqXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlczogW1wiKlwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgY29uc3QgYXV0aGVudGljYXRlZFJvbGUgPSBuZXcgUm9sZSh0aGlzLCAnRU1TRGVmYXVsdEF1dGhlbnRpY2F0ZWRSb2xlJywge1xuICAgICAgcm9sZU5hbWU6ICdFTVMtRGVmYXVsdC1BdXRoZW50aWNhdGVkJyxcbiAgICAgIGFzc3VtZWRCeTogbmV3IEZlZGVyYXRlZFByaW5jaXBhbCgnY29nbml0by1pZGVudGl0eS5hbWF6b25hd3MuY29tJywge1xuICAgICAgICBcIlN0cmluZ0VxdWFsc1wiOiB7IFwiY29nbml0by1pZGVudGl0eS5hbWF6b25hd3MuY29tOmF1ZFwiOiBpZGVudGl0eVBvb2wucmVmIH0sXG4gICAgICAgIFwiRm9yQW55VmFsdWU6U3RyaW5nTGlrZVwiOiB7IFwiY29nbml0by1pZGVudGl0eS5hbWF6b25hd3MuY29tOmFtclwiOiBcImF1dGhlbnRpY2F0ZWRcIiB9LFxuICAgICAgfSwgXCJzdHM6QXNzdW1lUm9sZVdpdGhXZWJJZGVudGl0eVwiKSxcbiAgICB9KTtcblxuICAgIGF1dGhlbnRpY2F0ZWRSb2xlLmFkZFRvUG9saWN5KG5ldyBQb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlZmZlY3Q6IEVmZmVjdC5BTExPVyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibW9iaWxlYW5hbHl0aWNzOlB1dEV2ZW50c1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY29nbml0by1zeW5jOipcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNvZ25pdG8taWRlbnRpdHk6KlwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlczogW1wiKlwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcblxuICAgIGNvbnN0IGlkZW50aXR5UG9vbFJvbGVBdHRhY2htZW50ID0gbmV3IENmbklkZW50aXR5UG9vbFJvbGVBdHRhY2htZW50KHRoaXMsICdFTVNJZGVudGl0eVBvb2xSb2xlQXR0YWNobWVudCcsIHtcbiAgICAgIGlkZW50aXR5UG9vbElkOiBpZGVudGl0eVBvb2wucmVmLFxuICAgICAgcm9sZXM6IHtcbiAgICAgICAgJ3VuYXV0aGVudGljYXRlZCc6IHVuYXV0aGVudGljYXRlZFJvbGUucm9sZUFybixcbiAgICAgICAgJ2F1dGhlbnRpY2F0ZWQnOiBhdXRoZW50aWNhdGVkUm9sZS5yb2xlQXJuXG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==