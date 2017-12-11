import { at, omit, defaults } from "lodash";
import MurmurHash3 from "imurmurhash";
import React from "react";

const
    RAINBOW_COLORS = ["#ff6698", "#ffb366", "#ffff66", "#98ff66", "#6698ff"],
    MAX_HASH = Math.pow(2, 32);

const img = (...args)=> React.createElement('img', ...args);

export default (obj = {}) => {

    let
        defaultObj = defaults(obj, { width: 45, height: 45 }),
        hashedId = MurmurHash3(obj["id"]).result();

    return img(
       Object.assign(
            {
                src: `https://robohash.org/${hashedId.toString(16)}.png?size=${at(obj, 'width', 'height').join('x')}`,
                style: { backgroundColor: _.get(RAINBOW_COLORS, ~~(hashedId / MAX_HASH * RAINBOW_COLORS.length)) }
            },
            omit(defaultObj, 'src') // "..." object expander is a late es6 addition
        )
    );
};