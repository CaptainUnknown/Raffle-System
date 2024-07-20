import React, {useState} from "react";
import "./Announcement.scss";
import { ReactComponent as Cross } from "../../assets/icons/cross.svg";
import WhoopsiesLogo from "../../assets/WSL2.png";
import { useNavigate } from 'react-router-dom';

export default function Announcement({ title, content, CTALink, CTA, logoVisibility, CTAFunction }) {
    const [isOpen, setIsOpen] = useState(true);
    const navigate = useNavigate();
    const handleRedirect = (to) => {
        navigate(`/${to}`);
    };

    return <>
        {isOpen && (
            <div className="announcementOverlay">
                <div className="announcementContent">
                    <Cross className="cross" onClick={() => {setIsOpen(false)}}/>
                    {logoVisibility && <img src={WhoopsiesLogo} alt="Whoopsies New logo"/>}
                    <h1>{title}</h1>
                    <p>{content}</p>
                    { CTALink ? <button onClick={() => handleRedirect(CTALink)}>{CTA}</button> : <button onClick={CTAFunction}>{CTA}</button> }
                </div>
            </div>
        )}
    </>
}
