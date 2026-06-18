'use client';

import { EVENT_COLORS } from '@calendar-share/types';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  colors?: readonly string[];
}

export default function ColorPicker({ value, onChange, colors = EVENT_COLORS }: ColorPickerProps) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          aria-label={color}
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: color,
            border: value === color ? '3px solid #1a1a1a' : '2px solid transparent',
            outline: value === color ? '2px solid #fff' : 'none',
            outlineOffset: -4,
          }}
        />
      ))}
    </div>
  );
}
