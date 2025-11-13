import { useEffect, useState } from 'react';

const Debug = () => {
  const [info, setInfo] = useState({});

  useEffect(() => {
    const debugInfo = {
      // Screen info
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      screenAvailWidth: window.screen.availWidth,
      screenAvailHeight: window.screen.availHeight,
      
      // Window info
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      windowOuterWidth: window.outerWidth,
      windowOuterHeight: window.outerHeight,
      
      // Device pixel ratio (indicates display scaling)
      devicePixelRatio: window.devicePixelRatio,
      
      // Browser zoom level
      zoom: Math.round(window.devicePixelRatio * 100),
      
      // Document info
      documentWidth: document.documentElement.clientWidth,
      documentHeight: document.documentElement.clientHeight,
      
      // Computed font size
      rootFontSize: window.getComputedStyle(document.documentElement).fontSize,
      bodyFontSize: window.getComputedStyle(document.body).fontSize,
      
      // User agent
      userAgent: navigator.userAgent,
      
      // Platform
      platform: navigator.platform,
    };
    
    setInfo(debugInfo);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Debug Information</h1>
      
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-2xl font-semibold mb-4">Display Settings</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded">
            <h3 className="font-bold text-lg mb-2">Device Pixel Ratio</h3>
            <p className="text-2xl text-blue-600">{info.devicePixelRatio}</p>
            <p className="text-sm text-gray-600 mt-1">
              {info.devicePixelRatio === 1 && '✅ Normal (100%)'}
              {info.devicePixelRatio === 1.25 && '⚠️ Windows Scale: 125%'}
              {info.devicePixelRatio === 1.5 && '⚠️ Windows Scale: 150%'}
              {info.devicePixelRatio === 2 && '⚠️ Windows Scale: 200% or Retina'}
              {info.devicePixelRatio > 2 && '⚠️ High DPI Display'}
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded">
            <h3 className="font-bold text-lg mb-2">Estimated Zoom</h3>
            <p className="text-2xl text-green-600">{info.zoom}%</p>
            <p className="text-sm text-gray-600 mt-1">
              {info.zoom === 100 && '✅ Normal zoom'}
              {info.zoom !== 100 && '⚠️ Browser zoom is not 100%'}
            </p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-bold text-lg mb-2">Screen Resolution</h3>
          <p>Screen: {info.screenWidth} x {info.screenHeight}</p>
          <p>Available: {info.screenAvailWidth} x {info.screenAvailHeight}</p>
          <p>Window: {info.windowWidth} x {info.windowHeight}</p>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-bold text-lg mb-2">Font Sizes</h3>
          <p>Root (html): {info.rootFontSize}</p>
          <p>Body: {info.bodyFontSize}</p>
          <p className="text-sm text-gray-600 mt-2">
            Expected: 16px for both
          </p>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-bold text-lg mb-2">Platform</h3>
          <p className="text-sm break-all">{info.platform}</p>
          <p className="text-xs text-gray-600 mt-2 break-all">{info.userAgent}</p>
        </div>

        <div className="border-t pt-4 bg-yellow-50 p-4 rounded">
          <h3 className="font-bold text-lg mb-2">📋 Recommendations</h3>
          <ul className="list-disc list-inside space-y-2 text-sm">
            {info.devicePixelRatio > 1 && (
              <li className="text-orange-600">
                <strong>Windows Display Scaling detected ({Math.round(info.devicePixelRatio * 100)}%)</strong>
                <br />
                ➡️ Go to Windows Settings → Display → Scale and layout → Set to 100%
              </li>
            )}
            {info.zoom !== 100 && (
              <li className="text-orange-600">
                <strong>Browser zoom is {info.zoom}%</strong>
                <br />
                ➡️ Press Ctrl + 0 to reset zoom to 100%
              </li>
            )}
            {info.devicePixelRatio === 1 && info.zoom === 100 && (
              <li className="text-green-600">
                <strong>✅ Your display settings are optimal!</strong>
              </li>
            )}
          </ul>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-bold text-lg mb-2">Visual Test</h3>
          <div className="space-y-2">
            <p style={{ fontSize: '12px' }}>12px - Small text</p>
            <p style={{ fontSize: '14px' }}>14px - Normal text</p>
            <p style={{ fontSize: '16px' }}>16px - Base size (should match body)</p>
            <p style={{ fontSize: '18px' }}>18px - Large text</p>
            <p style={{ fontSize: '24px' }}>24px - Heading</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Debug;
