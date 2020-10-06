import React, { useState } from "react";
import Parse from "parse";
import { Flair, UserProfile } from "@clowdr-app/clowdr-db-schema";
import TagInput from "../../Inputs/TagInput/TagInput";
import FlairInput from "../../Inputs/FlairInput/FlairInput";
import useSafeAsync from "../../../hooks/useSafeAsync";
// @ts-ignore
import defaultProfilePic from "../../../assets/default-profile-pic.png";
import { handleParseFileURLWeirdness } from "../../../classes/Utils";
import ProgramPersonSelector from "../ProgramPersonSelector/ProgramPersonSelector";
import "./ProfileEditor.scss";
import AsyncButton from "../../AsyncButton/AsyncButton";

interface Props {
    profile: UserProfile;
    setViewing: () => void;
}

function sameObjects(xs: { id: string }[], ys: { id: string }[]) {
    return JSON.stringify(xs.map(x => x.id).sort()) ===
        JSON.stringify(ys.map(y => y.id).sort());
}

export default function ProfileEditor(props: Props) {
    const p = props.profile;

    const [displayName, setDisplayName] = useState(p.displayName);
    const [realName, setRealName] = useState(p.realName);
    const [pronouns, setPronouns] = useState(p.pronouns);
    const [affiliation, setAffiliation] = useState(p.affiliation);
    const [position, setPosition] = useState(p.position);
    const [country, setCountry] = useState(p.country);
    const [webpage, setWebpage] = useState(p.webpage);
    const [bio, setBio] = useState(p.bio);
    const [modifiedFlairs, setModifiedFlairs] = useState<Flair[]>([]);
    const [originalFlairs, setOriginalFlairs] = useState<Flair[]>([]);
    const [programPersonId, setProgramPersonId] = useState<string | undefined>(undefined);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    useSafeAsync(async () => {
        return await p.flairObjects;
    }, (flairs: Array<Flair>) => {
        setModifiedFlairs(flairs);
        setOriginalFlairs(flairs);
    }, []);

    const saveProfile = async (e: React.FormEvent) => {
        // Update the associated program person
        if (programPersonId !== undefined) {
            const ok = await Parse.Cloud.run("person-set-profile", {
                programPerson: programPersonId === "" ? undefined : programPersonId,
                profile: p.id,
                conference: (await p.conference).id,
            }) as boolean;

            if (!ok) {
                throw new Error("Could not save associated program authors.");
            }
        }

        const primaryFlair = modifiedFlairs.length > 0 ? modifiedFlairs.sort((x, y) => x.priority > y.priority ? -1 : x.priority === y.priority ? 0 : 1)[0] : undefined;

        p.realName = realName;
        p.displayName = displayName;
        p.pronouns = pronouns;
        p.affiliation = affiliation;
        p.position = position;
        p.country = country;
        p.webpage = webpage;
        p.flairObjects = Promise.resolve(modifiedFlairs);
        p.primaryFlair = Promise.resolve(primaryFlair);
        p.bio = bio;

        await p.save();
    };

    const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.item(0);
        if (file) {
            const data = new Uint8Array(await file.arrayBuffer());
            const parseFile = new Parse.File("photos-" + p.id + "-" + file.name, [...data]);
            await parseFile.save();

            p.profilePhoto = parseFile;
            await p.save();
        }
    };

    const makeTextInput =
        (label: string, value: string, setter: (x: string) => void, inputType: string = "text") => {
            const name = label.replace(/\s/g, "");

            return <>
                <label htmlFor={name}>{label}</label>
                <input
                    name={name}
                    type={inputType}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    disabled={isSaving}
                />
            </>;
        };

    const profilePhotoUrl = handleParseFileURLWeirdness(p.profilePhoto);

    const isFormDirty =
        p.realName !== realName ||
        p.displayName !== displayName ||
        p.pronouns !== pronouns ||
        p.affiliation !== affiliation ||
        p.position !== position ||
        p.country !== country ||
        p.webpage !== webpage ||
        p.bio !== bio ||
        !sameObjects(originalFlairs, modifiedFlairs);

    return <div className="profile-editor">
        <div className="content">
            <div className="photo">
                {profilePhotoUrl
                    ? <img src={profilePhotoUrl} alt={p.displayName + "'s avatar"} />
                    : <img src={defaultProfilePic} alt="default avatar" />
                }
                <div className="upload">
                    <input
                        disabled={isFormDirty}
                        name="photo"
                        id="photo"
                        type="file"
                        className="photo-input"
                        onChange={uploadPhoto}
                    />
                    <label
                        htmlFor="photo"
                        title={isFormDirty ? "Please save your profile info." : undefined}
                    >
                        Upload New Photo
                    </label>
                </div>
            </div>
            <form>
                {makeTextInput("Real Name", realName, setRealName)}
                {makeTextInput("Display Name", displayName, setDisplayName)}
                <label htmlFor="pronouns">Pronouns</label>
                <TagInput
                    name="pronouns"
                    tags={pronouns}
                    setTags={ps => setPronouns(ps)}
                    disabled={isSaving}
                />
                {makeTextInput(
                    "Affiliation",
                    affiliation ?? "",
                    (s) => setAffiliation(s === "" ? undefined : s)
                )}
                {makeTextInput(
                    "Position",
                    position ?? "",
                    (s) => setPosition(s === "" ? undefined : s)
                )}
                {makeTextInput(
                    "Country",
                    country ?? "",
                    (s) => setCountry(s === "" ? undefined : s)
                )}
                {makeTextInput(
                    "Webpage",
                    webpage ?? "",
                    (s) => setWebpage(s === "" ? undefined : s),
                    "url"
                )}
                <label htmlFor="flairs">Flairs</label>
                <p>Click a flair to toggle it on or off. Highlighted flairs will be shown on your profile.</p>
                <FlairInput name="flairs" flairs={modifiedFlairs} setFlairs={setModifiedFlairs} disabled={isSaving} />
                <label htmlFor="bio">Bio</label>
                <textarea
                    name="bio"
                    onChange={e => setBio(e.target.value)}
                    cols={30} rows={4}
                    value={bio}
                    disabled={isSaving}
                />
                <label>Program Author</label>
                <ProgramPersonSelector setProgramPersonId={setProgramPersonId} disabled={isSaving} />
                <div className="submit-container">
                    <button
                        type="button"
                        disabled={isFormDirty}
                        title={isFormDirty ? "Please save your profile info." : undefined}
                        onClick={props.setViewing}
                    >Preview</button>
                    <AsyncButton content="Save" action={saveProfile} setIsRunning={setIsSaving} />
                </div>
            </form>
        </div>
    </div>;
}
