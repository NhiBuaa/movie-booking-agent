'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
  altText?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  size = 180,
  className,
  altText = 'Mã QR vé điện tử',
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate QR Code', err);
        if (isMounted) setError(true);
      });

    return () => {
      isMounted = false;
    };
  }, [value, size]);

  if (error) {
    return (
      <div
        style={{
          width: size,
          height: size,
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#000000',
          fontSize: '11px',
          fontWeight: 600,
          textAlign: 'center',
          padding: 8,
        }}
      >
        Lỗi tạo mã QR
      </div>
    );
  }

  if (!qrDataUrl) {
    return (
      <div
        style={{
          width: size,
          height: size,
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666666',
          fontSize: '11px',
        }}
      >
        Đang tải QR...
      </div>
    );
  }

  return (
    <img
      src={qrDataUrl}
      alt={altText}
      width={size}
      height={size}
      className={className}
      style={{
        display: 'block',
        imageRendering: 'pixelated',
      }}
    />
  );
};
