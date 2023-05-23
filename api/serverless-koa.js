import serverless from "serverless-http";
import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import dotenv from "dotenv-defaults";

const region = process.env.AWS_REGION || "us-east-1";
const ssmEnvName = process.env.ENV_SSM_PARAM || "/reacddit/.env";
const ssmClient = new SSMClient({ region });

let ssmEnv;

/**
 * Get SSM parameters from the parameter store
 * @returns {Promise<Parameter>}
 * @see https://docs.aws.amazon.com/systems-manager/latest/APIReference/API_GetParametersByPath.html
 * @async
 * @param {string} ssmName - The name of the parameter to get
 */
async function getEnv(ssmName) {
  if (!ssmEnv) {
    const param = {
      Name: ssmName,
      WithDecryption: true,
    };

    const response = await ssmClient.send(new GetParameterCommand(param));
    if (response.Parameter?.Value) {
      ssmEnv = dotenv.parse(response.Parameter.Value);
    } else {
      throw new Error(`Failed to get SSM parameter: ${ssmName}`);
    }
  } else {
    console.log("Using cached SSM parameters");
  }
  return ssmEnv;
}

export const handler = async (event, context) => {
  try {
    const envValues = await getEnv(ssmEnvName);
    for (const key in envValues) {
      process.env[key] = envValues[key]; // add each key-value pair to process.env
    }
    console.log("process.env parameters set", process.env);
  } catch (error) {
    console.error(`Failed to set process.env parameters: ${error}`);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to set process.env parameters",
      }),
    };
  }

  // Dynamically import the app after setting the environment variables
  const { default: app } = await import("./src/app.js");
  const serverlessHandler = serverless(app);
  return serverlessHandler(event, context);
};
