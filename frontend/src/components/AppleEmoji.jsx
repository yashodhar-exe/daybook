import React from 'react';
import { getMoodEmoji } from '../utils/moodEmoji';

export const AppleEmoji = ({
  emoji,
  size = 22,
  className = '',
  style = {},
}) => {
  const cleanEmoji = getMoodEmoji(emoji);

  if (!cleanEmoji) return null;

  return (
    <span
      className={`apple-emoji ${className}`}
      style={{
        fontFamily: "'Apple Color Emoji', -apple-system, BlinkMacSystemFont, sans-serif",
        fontSize: `${size}px`,
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        verticalAlign: 'middle',
        userSelect: 'none',
        pointerEvents: 'none',
        ...style,
      }}
      role="presentation"
      aria-hidden="true"
    >
      {cleanEmoji}
    </span>
  );
};
