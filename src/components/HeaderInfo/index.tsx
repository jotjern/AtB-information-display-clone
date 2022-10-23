import * as time_utils from '../../utils/time_utils';

import { useState } from "react";

import "./HeaderInfo.css";

export default function HeaderInfo() {
    const [time, setTime] = useState<Date>(new Date());

    const update_time = () => {
        setTime(new Date());
    }

    setInterval(update_time, 1000);

    return <div className="header-info-container">
        <span className="header-info-left">Solsiden</span>
        <span className="header-info-right">{time_utils.time_string(new Date())}</span>
    </div>
}