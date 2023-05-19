import app from "./src/app.js";
import serverless from "serverless-http";
import { GetParametersByPathCommand, SSMClient } from "@aws-sdk/client-ssm";

const region = process.env.AWS_REGION || "us-east-1";
const ssmPrefix = process.env.SSM_PREFIX || "/reacddit";
const ssmClient = new SSMClient({ region });

let ssmParameters;

/**
 * Get SSM parameters from the parameter store
 * @param {string} path - The prefix to the parameters in the parameter store
 * @returns {Promise<Parameter>}
 * @see https://docs.aws.amazon.com/systems-manager/latest/APIReference/API_GetParametersByPath.html
 * @async
 */
async function getSSMParameters(path) {
  if (!ssmParameters) {
    const command = new GetParametersByPathCommand({
      Path: path,
      WithDecryption: true,
    });
    const response = await ssmClient.send(command);
    ssmParameters = response.Parameters.reduce((acc, parameter) => {
      const paramName = parameter.Name.split("/").pop(); // Get last segment of the SSM parameter path
      acc[paramName] = parameter.Value;
      return acc;
    }, {});
  }
  return ssmParameters;
}

export const handler = async (event, context) => {
  try {
    const parameters = await getSSMParameters(ssmPrefix);
    process.env.REDDIT_CLIENT_ID = parameters.reddit_client_id;
    process.env.REDDIT_CLIENT_SECRET = parameters.reddit_client_secret;
    process.env.SALT = parameters.salt;
  } catch (error) {
    console.error(`Failed to set process.env parameters: ${error}`);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to set process.env parameters",
      }),
    };
  }

  const serverlessHandler = serverless(app);
  return serverlessHandler(event, context);
};
