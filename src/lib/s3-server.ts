import AWS from "aws-sdk"
import fs from "fs"

export async function downloadFromS3(file_key: string) {
  try {
    const s3 = new AWS.S3({
      region: "eu-west-1",
      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
      },
    });
    const params = {
      Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME!,
      Key: file_key,
    };

    const obj = await s3.getObject(params).promise();
    const file_name = `/tmp/pdf-${Date.now().toString()}.pdf`;
    fs.writeFileSync(file_name, obj.Body as Buffer)
    return file_name
  } catch (error) {
    console.log(error)
  }
}