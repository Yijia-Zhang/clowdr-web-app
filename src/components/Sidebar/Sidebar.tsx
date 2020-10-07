import React, { useEffect, useRef, useState } from 'react';
import './Sidebar.scss';
import useConference from '../../hooks/useConference';
import useMaybeUserProfile from '../../hooks/useMaybeUserProfile';
import FooterLinks from '../FooterLinks/FooterLinks';
import { Link } from 'react-router-dom';
import MenuGroup, { MenuGroupItems } from './Menu/MenuGroup';
import MenuItem from './Menu/MenuItem';
import useUserRoles from '../../hooks/useUserRoles';
import { handleParseFileURLWeirdness } from '../../classes/Utils';
import useSafeAsync from '../../hooks/useSafeAsync';
import ChatsGroup from './Groups/ChatsGroup';
import RoomsGroup from './Groups/RoomsGroup';
import ProgramGroup from './Groups/ProgramGroup';

interface Props {
    open: boolean,
    toggleSidebar?: () => void
    doLogout?: () => void
}

const minSearchLength = 3;

export default function Sidebar(props: Props) {
    const conf = useConference();
    const mUser = useMaybeUserProfile();
    const burgerButtonRef = useRef<HTMLButtonElement>(null);
    const { isAdmin } = useUserRoles();
    const [bgColour, setBgColour] = useState<string>("#761313");

    // TODO: When sidebar is occupying full window (e.g. on mobile), close it
    // when the user clicks a link.

    useSafeAsync(async () => {
        const details = await conf.details;
        return details.find(x => x.key === "SIDEBAR_COLOUR")?.value ?? "#761313";
    }, setBgColour, [conf]);

    useEffect(() => {
        burgerButtonRef.current?.focus();
    }, [burgerButtonRef, props.open]);

    // TODO: Use 'M' key as a shortcut to open/close menu?
    // TODO: Use 'C/R/P' to jump focus to menu expanders
    // TODO: Document shortcut keys prominently on the /help page

    const sideBarButton = <div className="sidebar-button">
        <button
            aria-label="Open Menu"
            onClick={props.toggleSidebar}
            className={props.open ? " change" : ""}
            ref={burgerButtonRef}
        >
            <div className="bar1"></div>
            <div className="bar2"></div>
            <div className="bar3"></div>
        </button>
    </div>;

    const sideBarHeading = <h1 aria-level={1} className={conf.headerImage ? "img" : ""}>
        <Link to="/" aria-label="Conference homepage">
            {conf.headerImage ? <img src={handleParseFileURLWeirdness(conf.headerImage) ?? undefined} alt={conf.shortName} /> : conf.shortName}
        </Link>
    </h1>;
    const headerBar = <div className="sidebar-header">
        {sideBarButton}
        {sideBarHeading}
    </div>

    let mainMenuGroup: JSX.Element = <></>;
    const chatsExpander: JSX.Element = <ChatsGroup minSearchLength={minSearchLength} />;
    const roomsExpander: JSX.Element = <RoomsGroup minSearchLength={minSearchLength} />;
    const programExpander: JSX.Element = <ProgramGroup minSearchLength={minSearchLength} />;

    if (mUser) {
        const mainMenuItems: MenuGroupItems = [
            { key: "watched-items", element: <MenuItem title="Watched items" label="Watched items" action="/watched" /> },
            { key: "exhibits", element: <MenuItem title="Exhibition" label="Exhibition" action="/exhibits" /> },
            { key: "profile", element: <MenuItem title="Profile" label="Profile" action="/profile" /> },
            { key: "contact-moderators", element: <MenuItem title="Contact moderators" label="Contact moderators" action="/moderators" /> },
        ];
        if (isAdmin) {
            mainMenuItems.push({ key: "admin", element: <MenuItem title="Admin tools" label="Admin tools" action="/admin" /> });
        }
        mainMenuGroup = <MenuGroup items={mainMenuItems} />;
    }

    return <>
        {!props.open ? sideBarButton : <></>}
        <div
            className={`sidebar${props.open ? "" : " closed"}`}
            style={{
                backgroundColor: bgColour
            }}>
            {headerBar}
            <div className="sidebar-scrollable">
                <div className="menu">
                    {mainMenuGroup}

                    {chatsExpander}

                    {roomsExpander}

                    {programExpander}
                </div>

                <FooterLinks doLogout={mUser ? props.doLogout : undefined} />
            </div>
        </div>
    </>;
}
