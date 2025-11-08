import { randomBytes } from "node:crypto"
import path from "node:path"
import { Storage } from "@google-cloud/storage"

const storage = new Storage({
  projectId: process.env.GCP_PROJECT || 'hackathon-gcp-cloud-run',
  keyFilename: process.env.NODE_ENV === 'development' ? '/Users/andi/Me/hackathon/kmai/km-api/hackathon-pub-sub.json' : undefined,
})

const defaultBucketName = process.env.GCS_BUCKET || 'kmai_upload'

export type StoredMaterialFile = {
  uri: string
  gcsUri: string
  mimeType: string
  name: string
}

export type UploadableMaterialFile = Blob & { name?: string; type?: string }

function getBucket() {
  if (!defaultBucketName) {
    throw new Error("GCS_BUCKET env var is required for file uploads")
  }
  return storage.bucket(defaultBucketName)
}

function randomSuffix(bytes = 6) {
  return randomBytes(bytes).toString("hex")
}

export async function uploadMaterialFile(
  file: UploadableMaterialFile,
  { classId }: { classId: string },
): Promise<StoredMaterialFile & { objectPath: string }> {
  const bucket = getBucket()
  const originalName = "name" in file && typeof file.name === "string" ? file.name : "file"
  const ext = path.extname(originalName)
  const safeExt = ext.slice(0, 10)
  const objectPath = [
    "materials",
    classId,
    `${Date.now()}-${randomSuffix()}${safeExt}`,
  ]
    .map((segment) => segment.replace(/[^a-zA-Z0-9._/-]/g, "-"))
    .join("/")

  const buffer = Buffer.from(await file.arrayBuffer())
  const mimeType = "type" in file && file.type ? file.type : "application/octet-stream"
  const gcsFile = bucket.file(objectPath)
  await gcsFile.save(buffer, {
    resumable: false,
    contentType: mimeType,
    metadata: {
      cacheControl: "public, max-age=3600",
      metadata: {
        originalName,
      },
    },
  })
  const publicUri = `https://storage.googleapis.com/${bucket.name}/${objectPath}`
  const gcsUri = `gs://${bucket.name}/${objectPath}`

  return {
    uri: publicUri,
    gcsUri,
    mimeType,
    name: originalName,
    objectPath,
  }
}

export async function deleteMaterialFile(gcsUri: string) {
  if (!gcsUri.startsWith("gs://")) {
    return
  }
  const withoutScheme = gcsUri.slice("gs://".length)
  const slashIndex = withoutScheme.indexOf("/")
  if (slashIndex <= 0) {
    return
  }
  const bucketName = withoutScheme.slice(0, slashIndex)
  const objectPath = withoutScheme.slice(slashIndex + 1)
  const bucket = storage.bucket(bucketName)
  const file = bucket.file(objectPath)
  try {
    await file.delete({ ignoreNotFound: true })
  } catch (error) {
    console.error("[gcs:deleteMaterialFile] delete failed", error)
  }
}
