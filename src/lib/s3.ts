import AWS from "aws-sdk"
import fs from "fs"

export async function uploadToS3(file: File) {
  try {
    AWS.config.update({
      accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY
    })
    const file_key =
        "uploads/" + Date.now().toString() + file.name.replace(" ", "-");
    const s3 = new AWS.S3({
      region: "eu-west-1",
      params: {
        Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME,
      },
    })

    s3.putObject({
      Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME!,
      Key: file_key,
      Body: file,
    }).on('httpDownloadProgress', event => {
      console.log('Uploading to s3...', parseInt(((event.loaded * 100) / event.total).toString()) + "%");
    }).promise();

    return Promise.resolve({
      file_key,
      file_name: file.name
    })
  } catch (error) {
    
  }
}

// export async function downloadFromS3(file_key: string): Promise<string> {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const s3 = new AWS.S3({
//         region: "eu-west-1",
//         credentials: {
//           accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
//           secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
//         },
//       });
//       const params = {
//         Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
//         Key: file_key,
//       };

//       const obj = await s3.getObject(params).promise();
//       const file_name = `/tmp/pdf-${Date.now().toString()}.pdf`;
//       fs.writeFileSync(file_name, obj.Body as Buffer);
//       if (obj.Body instanceof require("stream").Readable) {
//         // AWS-SDK v3 has some issues with their typescript definitions, but this works
//         // https://github.com/aws/aws-sdk-js-v3/issues/843
//         //open the writable stream and write the file
//         const file = fs.createWriteStream(file_name);
//         file.on("open", function (fd) {
//           // @ts-ignore
//           obj.Body?.pipe(file).on("finish", () => {
//             return resolve(file_name);
//           });
//         });
//         // obj.Body?.pipe(fs.createWriteStream(file_name));
//       }
//     } catch (error) {
//       console.error(error);
//       reject(error);
//       return null;
//     }
//   });
// }


export function getS3Url(file_key: string){
  const url = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.eu-west-1.amazonaws.com/${file_key}`;
  return url;
}