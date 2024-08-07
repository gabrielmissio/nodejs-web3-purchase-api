import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  UpdateCommand,
  QueryCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb'

export default class WalletRepository {
  constructor({ region, tableName }) {
    this.tableName = tableName
    this.client = new DynamoDBClient({ region })
    this.docClient = DynamoDBDocumentClient.from(this.client)
  }

  async saveAddress({ walletId, dp, ...data }) {
    const putCommand = new PutCommand({
      TableName: this.tableName,
      Item: {
        ...data,
        PK: walletId,
        SK: dp,
      },
    })

    await this.docClient.send(putCommand)

    return {
      walletId,
      dp,
      ...data,
    }
  }

  async getAddress({ address }) {
    const queryCommand = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'address-index',
      KeyConditionExpression: 'address = :address',
      ExpressionAttributeValues: {
        ':address': address,
      },
    })

    const result = await this.docClient.send(queryCommand)
    if (result.Items.length < 1) {
      return null
    }

    const { SK, PK, ...data } = result.Items[0]

    return {
      walletId: PK,
      dp: SK,
      ...data,
    }
  }

  async incrementCounter({ walletId, dp }) {
    const updateCommand = new UpdateCommand({
      TableName: this.tableName,
      Key: {
        PK: walletId,
        SK: dp,
      },
      UpdateExpression: 'SET #count = if_not_exists(#count, :start) + :inc',
      ExpressionAttributeNames: {
        '#count': 'count',
      },
      ExpressionAttributeValues: {
        ':start': 0,
        ':inc': 1,
      },
      ReturnValues: 'ALL_NEW',
    })

    const result = await this.docClient.send(updateCommand)
    return result.Attributes
  }
}
