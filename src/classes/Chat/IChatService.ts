import { Conference, UserProfile } from "@clowdr-app/clowdr-db-schema";
import { TextChat as TextChatSchema } from "@clowdr-app/clowdr-db-schema/build/DataLayer/Schema";
import IChannel from "./IChannel";

export default interface IChatService {
    setup(conference: Conference, userProfile: UserProfile, sessionToken: string): Promise<void>;
    teardown(): Promise<void>;

    channels(filterF: (current: TextChatSchema) => boolean): Promise<Array<IChannel>>;
    activeChannels(): Promise<Array<IChannel>>;

    getChannel(channelSid: string): Promise<IChannel>;

    createChannel(invite: Array<string>, isPrivate: boolean, title: string): Promise<IChannel>;

    enableAutoRenewConnection(): Promise<void>;
    enableAutoJoinOnInvite(): Promise<void>;
}
