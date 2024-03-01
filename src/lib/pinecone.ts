import { Pinecone, PineconeRecord} from "@pinecone-database/pinecone"
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { Document, RecursiveCharacterTextSplitter } from "@pinecone-database/doc-splitter"
import { getEmbeddings } from "./embeddings";
import md5 from "md5";
import { convertToAscii } from "./utils";

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

// Initialize pinecone
export const getPineconeClient = () => {
  return new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });
};

export async function loadS3IntoPinecone(fileKey: string) {
  // 1. obtain the pdf -> downlaod and read from pdf
  console.log("downloading s3 into file system:", fileKey);
  const file_name = await downloadFromS3(fileKey);
  if (!file_name) {
    throw new Error("could not download from s3");
  }
  console.log("loading pdf into memory" + file_name);
  const loader = new PDFLoader(file_name);
  const pages = (await loader.load()) as PDFPage[];

  // 2. split and segment the pdf into the small document
  const documents = await Promise.all(pages.map(prepareDocument));

  // 3. vectorise and embed individual documents
  // we flatten the document, and in each document we call the embedDocument, it will return the real vector
  const vectors = await Promise.all(documents.flat().map(embedDocument));

  // 4. upload to pinecone db
  const client = await getPineconeClient();
  const pineconeIndex = await client.index("chatpdf");
  console.log('inserting vectors into pinecone')
  // if the file key is not in ASCII characters, it will throw an error within pinecone?
  const namespace = pineconeIndex.namespace(convertToAscii(fileKey));
  // insert the document to db (index)
  await namespace.upsert(vectors);

  return documents[0]
} 

async function embedDocument(doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent);
    // id the vector within pinecode
    const hash = md5(doc.pageContent);

    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.metadata.text,
        pageNumber: doc.metadata.pageNumber,
      },
    } as PineconeRecord;
  } catch (error) {
    console.log("error embedding document", error);
    throw error;
  }
}

export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

// it takes in one single page and plit into multiple docs
async function prepareDocument(page: PDFPage) {
  let { pageContent, metadata } = page;
  pageContent = pageContent.replace(/\n/g, '');
  //split the docs
  const splitter = new RecursiveCharacterTextSplitter();
  // this doc will be vectorized and stored in pinecone
  // pinecone only accept string the metadata text up to 36000?
  // this create docs with metadata inclu. pageNumber and text
  const docs = await splitter.splitDocuments([new Document({
    pageContent,
    metadata: {
      pageNumber: metadata.loc.pageNumber,
      text: truncateStringByBytes(pageContent, 36000)
    }
  })])
  return docs;
}