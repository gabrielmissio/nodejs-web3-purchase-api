const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3')

class ABIRepository {
  constructor({
    region = process.env.AWS_REGION,
    bucketName = process.env.ABI_BUCKET_NAME,
    bucketABIsPath = process.env.ABI_BUCKET_PATH,
  }) {
    this.bucketName = bucketName
    this.bucketABIsPath = bucketABIsPath
    this.s3Client = new S3Client({ region })
  }

  async loadABI(abiName) {
    return this.#loadFromS3(abiName)
  }

  async #loadFromS3(abiName) {
    if (!abiName) {
      throw new Error('ABI Name is required')
    }

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
