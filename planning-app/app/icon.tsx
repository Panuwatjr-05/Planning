import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        background: '#0d1117',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '7px',
      }}
    >
      <div
        style={{
          color: 'white',
          fontSize: '20px',
          fontWeight: '900',
          fontFamily: 'sans-serif',
          lineHeight: 1,
          letterSpacing: '-1px',
        }}
      >
        P
      </div>
    </div>,
    { ...size }
  )
}
