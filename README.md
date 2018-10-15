
Install dependencies
```shell
npm install --prefix src/
```
Create deployment bucket
```shell
aws s3 mb s3://DEPLOYMENT_BUCKET_NAME
```
Package your application
```shell
aws cloudformation package \
   --template-file template.yaml \
   --output-template-file template-packaged.yaml \
   --s3-bucket DEPLOYMENT_BUCKET_NAME
```
Deploy config rules
```shell
aws cloudformation deploy \
   --template-file template-packaged.yaml \
   --stack-name lambda-config-rules \
   --capabilities CAPABILITY_IAM \
   `# optionally add FunctionShield token to enable protection (http://bit.ly/2AaBJ3x)` \ 
   --parameter-overrides FunctionShieldToken=YOUR_FUNCTION_SHIELD_TOKE
```
