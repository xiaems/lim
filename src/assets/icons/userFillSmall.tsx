import Svg, { Path } from 'react-native-svg';
import React from 'react';

export function UserFillSmall() {
    return (
        <Svg width={16} height={16} fill="none">
            <Path
                fill="#171C26"
                d="M8 1.333A3.17 3.17 0 0 0 4.833 4.5c0 1.713 1.34 3.1 3.087 3.16a.538.538 0 0 1 .147 0h.047a3.159 3.159 0 0 0 3.053-3.16A3.17 3.17 0 0 0 8 1.333ZM11.387 9.433c-1.86-1.24-4.894-1.24-6.767 0-.847.567-1.313 1.334-1.313 2.154 0 .82.466 1.58 1.306 2.14.934.626 2.16.94 3.387.94 1.227 0 2.453-.314 3.387-.94.84-.567 1.306-1.327 1.306-2.154-.006-.82-.466-1.58-1.306-2.14Z"
            />
        </Svg>
    );
}