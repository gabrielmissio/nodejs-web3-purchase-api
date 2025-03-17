const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3')

class ABIRepository {
  constructor({
    region = process.env.AWS_REGION,
    bucketName = process.env.ABI_BUCKET_NAME,
    bucketABIsPath = process.env.ABI_BUCKET_PATH,
  }) {
    console.log({ // TODO: remove this line
      region: process.env.AWS_REGION,
      bucketName: process.env.ABI_BUCKET_NAME,
      bucketABIsPath: process.env.ABI_BUCKET_PATH,
    })

    this.bucketName = bucketName
    this.bucketABIsPath = bucketABIsPath
    this.s3Client = new S3Client({ region })
  }

  async loadABI(abiName) {
    try { // TODO: remove try-catch
      return this.#loadFromS3(abiName)
    } catch (error) {
      console.error(error)
      throw new Error('Error loading ABI')
    }
  }

  async #loadFromS3(abiName) {
    if (!abiName) {
      throw new Error('ABI Name is required')
    }

    console.log({
      Bucket: this.bucketName,
      Key: `${this.bucketABIsPath}/${abiName}.json`,
    })

    const getObjectCommand = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: `${this.bucketABIsPath}/${abiName}.json`,
    })

    const { Body } = await this.s3Client.send(getObjectCommand)
    const data = await Body.transformToString()

    return JSON.parse(data)
  }
}

module.exports = new ABIRepository({})
