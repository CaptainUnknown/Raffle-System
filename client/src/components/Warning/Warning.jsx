import React from "react";
import "./Warning.scss";

export default function Warning({ statement }) {
    return <>
        <div className='warning'>
            <h2>{'⚠️' + statement}</h2>
        </div>
    </>
}
