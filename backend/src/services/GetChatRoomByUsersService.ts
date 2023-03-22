import { injectable } from "tsyringe";

import { prismaClient } from "../database/prismaClient";

interface IGetChatRoomByUsersDTO {
  ofUserId: string;
  toUserId: string;
}

@injectable()
class GetChatRoomByUsersService {
  async execute({ ofUserId, toUserId }: IGetChatRoomByUsersDTO) {
    const roomExistsOfAndToUserId = await prismaClient.chatRoons.findFirst({
      where: {
        ofUserId: ofUserId,
        toUserId: toUserId,
      },
    });

    const roomExistsToAndOfUserId = await prismaClient.chatRoons.findFirst({
      where: {
        ofUserId: toUserId,
        toUserId: ofUserId,
      },
    });

    if (roomExistsOfAndToUserId) {
      return roomExistsOfAndToUserId;
    } else if (roomExistsToAndOfUserId) {
      return roomExistsToAndOfUserId;
    } else {
      return null;
    }
  }
}

export { GetChatRoomByUsersService };
