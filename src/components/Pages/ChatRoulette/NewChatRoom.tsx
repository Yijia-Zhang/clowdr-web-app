import React, { useState } from "react";
import { Redirect } from "react-router-dom";
import Toggle from "react-toggle";
import useHeading from "../../../hooks/useHeading";
import useMaybeVideo from "../../../hooks/useMaybeVideo";
import AsyncButton from "../../AsyncButton/AsyncButton";
import { addError } from "../../../classes/Notifications/Notifications";
import "./NewChatRoom.scss";
import useUserRoles from "../../../hooks/useUserRoles";

export default function NewChatRoom() {
    const mVideo = useMaybeVideo();
    const [newRoomId, setNewRoomId] = useState<string | null>(null);

    const [title, setTitle] = useState<string>("Private Room");
    const [capacity, setCapacity] = useState<number>(10);
    const [isPersistent, setIsPersistent] = useState<boolean>(false);
    const [isPrivate, setIsPrivate] = useState<boolean>(false);
    const { isAdmin, isManager } = useUserRoles();

    useHeading("New room");

    /**
     * Elements that need to be on this page (as a MVP):
     *
     *    * Room title
     *    * Public vs private selector
     *    * Ephemeral selector (forced to true if not an admin/manager)
     */

    async function doCreateRoom() {
        const _newRoomId = await mVideo?.createRouletteRoom(
            2, true, false, "Chat Roulette Room", "roulette");
        console.log(`New room id: ${_newRoomId}`);
        setNewRoomId(_newRoomId ?? null);
    }

    // const capacityEl : number = 2;
    // const privateEl : boolean = false;
    //
    // const persistentEl : boolean = false;
    // const titleEl : string = "Private room";
    const createButton =
        <AsyncButton action={() => doCreateRoom()} children="Ready" />;

    return newRoomId
        ? <Redirect to={`/roulette/${newRoomId}`} />
        : <div className="new-video-room">
            <form onSubmit={() => doCreateRoom()}>
                {/*{capacityEl}<br />*/}
                {/*{titleEl}<br />*/}
                {/*{privateEl}<br />*/}
                {/*{isAdmin || isManager ? <>{persistentEl}<br/></> : <></>}*/}
                <div className="submit-container">
                    {createButton}
                </div>
            </form>
        </div>;
}
