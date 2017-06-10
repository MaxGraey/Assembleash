import React from "react"
import { Tooltip } from 'react-bootstrap';

export default function tooltip(text = '') {
    return <Tooltip id="tooltip"><h4>{ text }</h4></Tooltip>;
}
