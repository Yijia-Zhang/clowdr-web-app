import React, {Component} from "react";
import {Layout} from "antd";

import "./GenericLanding.css";
const {Header, Content, Footer, Sider} = Layout;

export default class GenericLanding extends Component {
    constructor(props) {
        super(props);
;
    }

    render() {
        return <div id="landing-page">
            <header style={{height: "100vh",
                backgroundImage: "url(/backgrounds/error.jpg)"
            }}>
            <div className="header-content" style={{top: "33%"}}>
                <div className="header-content-inner" style={{backgroundColor:"rgba(1,1,1,.5)", maxWidth:"800px"}}>

                    <h1>CLOWDR</h1>
                    <p style={{marginLeft: 'auto', marginRight: 'auto'}}>
                        You are not logged in. Please try to log in again from slack by typing /video in any channel.
                    </p>
                </div>
            </div>
            </header>
        </div>
    }
}

