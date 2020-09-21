import assert from "assert";
import { Conference, ConferenceConfiguration, UserProfile } from "clowdr-db-schema/src/classes/DataLayer";

export default class Chat {
    private static chat: Chat | null = null;

    private _REACT_APP_TWILIO_CALLBACK_URL: string | null = null;

    constructor(
        private conference: Conference,
        private profile: UserProfile,
        private sessionToken: string
    ) {
    }

    public async initialise(): Promise<boolean> {
        let token = await this.getToken();
        if (!token) {
            // TODO: Use a debug logger
            console.log("[Chat]: twilio token not obtained.");
            return false;
        }
        return true;
    }

    public async teardown(): Promise<void> {

    }

    private async get_REACT_APP_TWILIO_CALLBACK_URL(): Promise<string> {
        if (!this._REACT_APP_TWILIO_CALLBACK_URL) {
            let results = await ConferenceConfiguration.getByKey("REACT_APP_TWILIO_CALLBACK_URL", this.conference.id);
            assert(results.length, "Conference Twilio not configured.");
            this._REACT_APP_TWILIO_CALLBACK_URL = results[0].value;
        }
        return this._REACT_APP_TWILIO_CALLBACK_URL;
    }

    private async getToken(): Promise<string | null> {
        // TODO: Move into Twilio client

        // TODO: Use a debug logger
        console.log(`[Chat]: Fetching chat token for ${this.profile.displayName} (${this.profile.id}), ${this.conference.name} (${this.conference.id})`);

        let callbackUrl = await this.get_REACT_APP_TWILIO_CALLBACK_URL();
        const res = await fetch(
            `${callbackUrl}/chat/token`,
            {
                method: 'POST',
                body: JSON.stringify({
                    identity: this.sessionToken,
                    conference: this.conference.id
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        let data = await res.json();
        console.log(`[Chat]: Token obtained.`);
        return data.token;
    }

    public static async teardown() {
        Chat.chat?.teardown();
    }

    public static async initialise(conference: Conference, user: UserProfile, sessionToken: string) {
        let result = false;

        if (!Chat.chat) {
            Chat.chat = new Chat(conference, user, sessionToken);
            result = await Chat.chat.initialise();

            if (!result) {
                Chat.chat = null;
            }
        }

        // @ts-ignore
        if (!window.clowdr || !window.clowdr.chat) {
            // @ts-ignore
            window.clowdr = window.clowdr || {};
            // @ts-ignore
            window.clowdr.chat = Chat.chat;
        }

        return result;
    }
}
