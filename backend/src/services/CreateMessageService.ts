import { injectable } from "tsyringe";

import { prismaClient } from "../database/prismaClient";

interface ICreateMessageDTO {
  to: string;
  text: string;
  chatRoomId: string;
}

@injectable()
class CreateMessageService {
  async execute({ to, text, chatRoomId }: ICreateMessageDTO) {
    const message = await prismaClient.messages.create({
      data: {
        to,
        text,
        chatRoomId,
      },
    });

    return message;
  }
}

export { CreateMessageService };
