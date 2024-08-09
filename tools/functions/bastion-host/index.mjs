import { SSMClient, SendCommandCommand, GetCommandInvocationCommand } from '@aws-sdk/client-ssm'

const ssmClient = new SSMClient({ region: process.env.AWS_REGION })

export const handler = async (event) => {
  const instanceId = event.instanceId  // Pass your EC2 instance ID in the event
  const command = event.command        // Command to run on the EC2 instance

  if (!instanceId || !command) {
    return {
      statusCode: 400,
      body: 'Missing required parameters: instanceId or command',
    }
  }

  try {
    // Send command to the instance using SSM
    const sendCommandParams = {
      DocumentName: 'AWS-RunShellScript', // You can change this to use a different SSM document
      InstanceIds: [instanceId],
      Parameters: {
        commands: [command],
      },
    }
    const sendCommandCommand = new SendCommandCommand(sendCommandParams)
    const sendCommandResponse = await ssmClient.send(sendCommandCommand)
    const commandId = sendCommandResponse.Command.CommandId

    // Optionally, wait for the command to finish and get the output
    const getCommandInvocationParams = {
      CommandId: commandId,
      InstanceId: instanceId,
    }
    const getCommandInvocationCommand = new GetCommandInvocationCommand(getCommandInvocationParams)
    const result = await ssmClient.send(getCommandInvocationCommand)

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    }
  } catch (error) {
    console.error('Error sending command:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error sending command', error }),
    }
  }
}
