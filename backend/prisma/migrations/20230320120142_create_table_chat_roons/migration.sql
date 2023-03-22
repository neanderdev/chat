-- CreateTable
CREATE TABLE "chat_roons" (
    "id" TEXT NOT NULL,
    "ofUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,

    CONSTRAINT "chat_roons_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "chat_roons" ADD CONSTRAINT "chat_roons_ofUserId_fkey" FOREIGN KEY ("ofUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_roons" ADD CONSTRAINT "chat_roons_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
