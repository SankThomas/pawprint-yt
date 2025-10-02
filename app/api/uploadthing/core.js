import { auth } from "@clerk/nextjs/server";
import { createUploadthing } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  petImages: f({
    image: { maxFileSize: "16MB", maxFileCount: 20 },
  })
    .middleware(async () => {
      const { userId } = await auth();
      if (!userId) {
        throw new Error("Unauthorized: No Clerk user found");
      }
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete");
      console.log("File URL:", file.ufsUrl);
      console.log("Uploaded by user:", metadata.userId);

      return { uploadedBy: metadata.userId, fileUrl: file.ufsUrl };
    }),
};
