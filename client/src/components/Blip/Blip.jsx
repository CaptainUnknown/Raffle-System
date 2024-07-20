import React from "react";
import "./Blip.scss";

export default function Blip({ state, about, size, alignment }) {
    return <>
        <div className='blipStatus'
             style={{
                 '--blip-in': state ? '#04d104' : '#f5de00',
                 '--blip-out': state ? '#04d104C9' : '#f5de00C9',
                 '--blip-size': `${size || 18 }px`,
                 alignSelf: alignment
        }}>
            <div className='blip'><div></div></div>
            { `${about + (state ? ' Active' : ' Paused')} ` }
        </div>
    </>
}
