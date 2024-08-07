import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'

export default class BlockcountRepository {
  constructor({ region, tableName }) {
    this.tableName = tableName
    this.client = new DynamoDBClient({ region })
    this.docClient = DynamoDBDocumentClient.from(this.client)
  }

  async findOne({ contractAddress, eventName }) {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: {
        contractAddress,
        eventName,
      },
    })

    const response = await this.docClient.send(command)
    return response.Item
  }

  async save(item) {
    if (!item.contractAddress || !item.eventName) {
      throw new Error('ContractAddress and EventName are required')
    }

    const command = new PutCommand({
      TableName: this.tableName,
      Item: item,
    })

    const response = await this.docClient.send(command)
    return response
  }
}
