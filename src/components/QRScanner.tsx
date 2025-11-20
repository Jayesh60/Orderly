'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void
  onScanError?: (error: string) => void
}

export default function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    if (!isScanning) return

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    )

    scanner.render(
      (decodedText) => {
        console.log(`QR Code detected: ${decodedText}`)
        onScanSuccess(decodedText)
        scanner.clear()
        setIsScanning(false)
      },
      (error) => {
        console.warn(`QR Code scan error: ${error}`)
        if (onScanError) {
          onScanError(error)
        }
      }
    )

    scannerRef.current = scanner

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear()
      }
    }
  }, [isScanning, onScanSuccess, onScanError])

  const startScanning = () => {
    setIsScanning(true)
  }

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear()
    }
    setIsScanning(false)
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {!isScanning && (
        <button
          onClick={startScanning}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Scan Table QR Code
        </button>
      )}
      
      {isScanning && (
        <div className="flex flex-col items-center space-y-4">
          <div id="qr-reader" className="w-full max-w-sm"></div>
          <button
            onClick={stopScanning}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Stop Scanning
          </button>
        </div>
      )}
    </div>
  )
}