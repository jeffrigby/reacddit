import serverless from "serverless-http";
import { getParameter } from "@aws-lambda-powertools/parameters/ssm";
import { Logger } from "@aws-lambda-powertools/logger";
import dotenv from "dotenv-defaults";
const ssmEnvName = process.env.ENV_SSM_PARAM || "/reacddit/.env";

const logger = new Logger();

const envValues = await getEnv(ssmEnvName);
setProcessEnv(envValues);

function setProcessEnv(envValues) {
  for (const key in envValues) {
    process.env[key] = envValues[key]; // Add each key-value pair to process.env
  }
}

/**
 * Get SSM parameters from the parameter store
 * @returns {Promise<Parameter>}
 * @see https://docs.aws.amazon.com/systems-manager/latest/APIReference/API_GetParametersByPath.html
 * @async
 * @param {string} ssmName - The name of the parameter to get
 */
async function getEnv(ssmName) {
  const parameter = await getParameter(ssmName, {
    maxAge: 3600,
    decrypt: true,
  });
  if (parameter) {
    return dotenv.parse(parameter);
  } else {
    throw new Error(`Failed to get SSM parameter: ${ssmName}`);
  }
}

export const handler = async (event, context) => {
  // Append awsRequestId to each log statement
  logger.appendKeys({
    awsRequestId: context.awsRequestId,
  });

  const {
    REDDIT_CLIENT_ID,
    REDDIT_CLIENT_SECRET,
    REDDIT_CALLBACK_URI,
    REDDIT_SCOPE,
    CLIENT_PATH,
  } = process.env;

  // Check if the environment variables are set
  if (
    !REDDIT_CLIENT_ID ||
    !REDDIT_CLIENT_SECRET ||
    !REDDIT_CALLBACK_URI ||
    !REDDIT_SCOPE ||
    !CLIENT_PATH
  ) {
    logger.error("Missing environment variables");
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Missing environment variables",
      }),
    };
  }

  try {
    // Dynamically import the app after setting the environment variables
    const { default: app } = await import("./src/app.js");
    const serverlessHandler = serverless(app);
    return serverlessHandler(event, context);
  } catch (error) {
    logger.error("Failed to import the app", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to import the app",
      }),
    };
  }
};
