import React, { useEffect, useState } from "react";
import { Link, Redirect } from "react-router-dom";
import useHeading from "../../../hooks/useHeading";
import useUserProfile from "../../../hooks/useUserProfile";
import ProfileEditor from "../../Profile/ProfileEditor/ProfileEditor";
import ProfileView from "../../Profile/ProfileView/ProfileView";
import useConference from "../../../hooks/useConference";
import { UserProfile } from "@clowdr-app/clowdr-db-schema";
import { makeCancelable } from "@clowdr-app/clowdr-db-schema/build/Util";
import LocalStorage from "../../../classes/LocalStorage/ProfileEditing";

interface Props {

}

export default function Connections(props: Props) {
    return <div>
        <h1>Connections</h1>
        <table className="table">
            <tr className="title">
                <th>Name</th>
                <th>Chat time</th>
            </tr>
            <tr>
                <td><Link to="/profile/">Mock Name 1</Link></td>
                <td>19:45 28/09/2020 PDT</td>
            </tr>
            <tr>
                <td><Link to="/profile/mockUserProfile2">Mock Name 2</Link></td>
                <td>19:50 28/09/2020 PDT</td>
            </tr>
        </table>
    </div>;
}
